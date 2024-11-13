const prisma = require("../config/connectDb");
const { subDays, startOfDay, endOfDay, format } = require('date-fns');

// Utility Functions
const getPaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;
  return { skip, take: limit, page };
};

async function getDashboardOverview(req, res) {
  try {
    const { start, end } = getDateRange(req.query.range);

    // Wrap everything in a single transaction to ensure data consistency
    const results = await prisma.$transaction(async (tx) => {
      // Basic counts with error handling
      const [
        userCount,
        groupCount,
        meetingCount,
        messageCount,
        announcementCount,
        sessionCount
      ] = await Promise.all([
        tx.user.count(),
        tx.group.count(),
        tx.meeting.count(),
        tx.message.count(),
        tx.announcement.count(),
        tx.session.count()
      ]);

      // User growth data
      const userGrowth = await tx.user.groupBy({
        by: ['createdAt'],
        _count: { _all: true },
        where: {
          createdAt: { 
            gte: start, 
            lte: end 
          }
        }
      });

      // Active users count with proper date filtering
      const activeUsers = await tx.user.count({
        where: {
          OR: [
            { 
              messages: { 
                some: { 
                  createdAt: { gte: start } 
                } 
              } 
            },
            { 
              sessions: { 
                some: { 
                  startTime: { gte: start } 
                } 
              } 
            },
            { 
              meetings: { 
                some: { 
                  startTime: { gte: start } 
                } 
              } 
            }
          ]
        }
      });

      // Count messages with files
      const fileStats = await tx.message.count({
        where: {
          AND: [
            { fileName: { not: null } },
            { fileType: { not: null } }
          ]
        }
      });

      // Count file attachments
      const attachmentCount = await tx.fileAttachment.count();

      return {
        counts: {
          userCount,
          groupCount,
          meetingCount,
          messageCount,
          announcementCount,
          sessionCount,
          activeUsers
        },
        userGrowth,
        storage: {
          messageFileCount: fileStats,
          attachmentCount
        }
      };
    });

    // Format the response
    const response = {
      overview: {
        totalUsers: results.counts.userCount,
        totalGroups: results.counts.groupCount,
        totalMeetings: results.counts.meetingCount,
        totalMessages: results.counts.messageCount,
        totalAnnouncements: results.counts.announcementCount,
        totalSessions: results.counts.sessionCount,
        activeUsers: results.counts.activeUsers,
        fileStats: {
          messagesWithFiles: results.storage.messageFileCount,
          totalAttachments: results.storage.attachmentCount
        }
      },
      growth: {
        users: results.userGrowth.map(day => ({
          date: format(day.createdAt, 'yyyy-MM-dd'),
          count: day._count._all
        }))
      },
      timestamp: new Date()
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Dashboard Overview Error:', error);
    
    res.status(500).json({
      error: "Failed to retrieve dashboard overview",
      details: error.message,
      timestamp: new Date(),
      path: '/admin/dashboard'
    });
  }
}

// Helper function for date range
function getDateRange(range) {
  const end = new Date();
  const start = subDays(end, parseInt(range) || 30);
  return { 
    start: startOfDay(start), 
    end: endOfDay(end) 
  };
}


// User Analytics
async function getUserAnalytics(req, res) {
  try {
    const { start, end } = getDateRange(req.query.range);

    const [
      userStats,
      topContributors,
      userRoles,
      inactiveUsers
    ] = await prisma.$transaction([
      // User engagement statistics
      prisma.user.aggregate({
        _avg: {
          _count: {
            messages: true,
            meetings: true,
            sessions: true
          }
        },
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      }),

      // Top contributing users
      prisma.user.findMany({
        take: 10,
        select: {
          id: true,
          username: true,
          email: true,
          _count: {
            select: {
              messages: true,
              announcements: true,
              meetings: true
            }
          }
        },
        orderBy: {
          messages: {
            _count: 'desc'
          }
        }
      }),

      // User role distribution
      prisma.user.groupBy({
        by: ['role'],
        _count: { _all: true }
      }),

      // Inactive users (no activity in date range)
      prisma.user.findMany({
        where: {
          AND: [
            { messages: { none: { createdAt: { gte: start } } } },
            { sessions: { none: { startTime: { gte: start } } } },
            { meetings: { none: { startTime: { gte: start } } } }
          ]
        },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
          lastLoginAt: true
        },
        take: 20
      })
    ]);

    res.status(200).json({
      engagement: {
        averageMessagesPerUser: userStats._avg._count.messages,
        averageMeetingsPerUser: userStats._avg._count.meetings,
        averageSessionsPerUser: userStats._avg._count.sessions
      },
      topContributors,
      roleDistribution: userRoles,
      inactiveUsers,
      timeRange: { start, end }
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve user analytics",
      details: error.message
    });
  }
}

// Group Analytics
async function getGroupAnalytics(req, res) {
  try {
    const { start, end } = getDateRange(req.query.range);

    const [
      groupStats,
      activeGroups,
      membershipTrends,
      messageDistribution
    ] = await prisma.$transaction([
      // Group statistics
      prisma.group.aggregate({
        _avg: {
          _count: {
            members: true,
            messages: true,
            meetings: true
          }
        }
      }),

      // Most active groups
      prisma.group.findMany({
        take: 10,
        include: {
          _count: {
            select: {
              members: true,
              messages: true,
              meetings: true,
              sessions: true
            }
          },
          leader: {
            select: {
              username: true,
              email: true
            }
          }
        },
        orderBy: {
          messages: {
            _count: 'desc'
          }
        }
      }),

      // Membership trends
      prisma.group.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              members: true
            }
          },
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20
      }),

      // Message distribution across groups
      prisma.message.groupBy({
        by: ['groupId'],
        _count: { _all: true },
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        },
        orderBy: {
          _count: {
            _all: 'desc'
          }
        },
        take: 10
      })
    ]);

    res.status(200).json({
      statistics: {
        averageMembers: groupStats._avg._count.members,
        averageMessages: groupStats._avg._count.messages,
        averageMeetings: groupStats._avg._count.meetings
      },
      activeGroups,
      membershipTrends,
      messageDistribution,
      timeRange: { start, end }
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve group analytics",
      details: error.message
    });
  }
}

// Meeting and Session Analytics
async function getMeetingAnalytics(req, res) {
  try {
    const { start, end } = getDateRange(req.query.range);

    const [
      meetingStats,
      upcomingMeetings,
      participationRates,
      sessionStats
    ] = await prisma.$transaction([
      // Meeting statistics
      prisma.meeting.aggregate({
        _avg: {
          duration: true,
          _count: {
            participants: true
          }
        },
        where: {
          startTime: {
            gte: start,
            lte: end
          }
        }
      }),

      // Upcoming meetings
      prisma.meeting.findMany({
        where: {
          startTime: {
            gte: new Date()
          }
        },
        include: {
          host: {
            select: {
              username: true
            }
          },
          group: {
            select: {
              name: true
            }
          },
          _count: {
            select: {
              participants: true
            }
          }
        },
        orderBy: {
          startTime: 'asc'
        },
        take: 10
      }),

      // Participation rates
      prisma.meeting.findMany({
        where: {
          startTime: {
            gte: start,
            lte: end
          }
        },
        select: {
          id: true,
          title: true,
          _count: {
            select: {
              participants: true
            }
          }
        },
        orderBy: {
          startTime: 'desc'
        },
        take: 20
      }),

      // Session statistics
      prisma.session.groupBy({
        by: ['groupId'],
        _count: { _all: true },
        _avg: {
          _all: true
        },
        where: {
          startTime: {
            gte: start,
            lte: end
          }
        }
      })
    ]);

    res.status(200).json({
      meetings: {
        averageDuration: meetingStats._avg.duration,
        averageParticipants: meetingStats._avg._count.participants,
        upcoming: upcomingMeetings,
        participationRates
      },
      sessions: {
        statistics: sessionStats,
        distribution: await getSessionDistribution(start, end)
      },
      timeRange: { start, end }
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve meeting analytics",
      details: error.message
    });
  }
}

// System Health and Performance
async function getSystemHealth(req, res) {
  try {
    const [
      databaseSize,
      tableStats,
      recentErrors,
      performanceMetrics
    ] = await prisma.$transaction([
      // Estimate database size
      prisma.$queryRaw`SELECT pg_size_pretty(pg_database_size(current_database()))`,

      // Table statistics
      prisma.$queryRaw`
        SELECT 
          schemaname,
          relname,
          n_live_tup,
          n_dead_tup,
          last_vacuum,
          last_autovacuum
        FROM pg_stat_user_tables
      `,

      // Recent errors (you'd need to implement error logging)
      prisma.notification.findMany({
        where: {
          type: 'ERROR',
          createdAt: {
            gte: subDays(new Date(), 7)
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20
      }),

      // Performance metrics (example queries)
      prisma.$transaction([
        prisma.message.count({
          where: {
            createdAt: {
              gte: subDays(new Date(), 1)
            }
          }
        }),
        prisma.meeting.count({
          where: {
            startTime: {
              gte: new Date()
            }
          }
        })
      ])
    ]);

    res.status(200).json({
      database: {
        size: databaseSize[0],
        tables: tableStats,
        performance: {
          messageRate: performanceMetrics[0],
          activeMeetings: performanceMetrics[1]
        }
      },
      errors: {
        recent: recentErrors,
        count: recentErrors.length
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve system health",
      details: error.message
    });
  }
}

// Audit Logs
async function getAuditLogs(req, res) {
  try {
    const { skip, take, page } = getPaginationParams(req.query);
    const { start, end } = getDateRange(req.query.range);

    const [logs, total] = await prisma.$transaction([
      prisma.notification.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end
          },
          type: req.query.type
        },
        include: {
          user: {
            select: {
              username: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take
      }),
      prisma.notification.count({
        where: {
          createdAt: {
            gte: start,
            lte: end
          },
          type: req.query.type
        }
      })
    ]);

    res.status(200).json({
      logs,
      pagination: {
        page,
        limit: take,
        totalPages: Math.ceil(total / take),
        totalItems: total
      },
      timeRange: { start, end }
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve audit logs",
      details: error.message
    });
  }
}

// Content Moderation
async function getContentModeration(req, res) {
  try {
    const { skip, take, page } = getPaginationParams(req.query);

    const [
      flaggedMessages,
      flaggedAnnouncements,
      moderationStats
    ] = await prisma.$transaction([
      // Flagged messages
      prisma.message.findMany({
        where: {
          flags: {
            some: {
              status: 'PENDING'
            }
          }
        },
        include: {
          user: {
            select: {
              username: true,
              email: true
            }
          },
          flags: true
        },
        skip,
        take
      }),

      // Flagged announcements
      prisma.announcement.findMany({
        where: {
          flags: {
            some: {
              status: 'PENDING'
            }
          }
        },
        include: {
          user: {
            select: {
              username: true,
              email: true
            }
          },
          flags: true
        },
        skip,
        take
      }),

      // Moderation statistics
      prisma.$transaction([
        prisma.message.count({
          where: {
            flags: {
              some: {}
            }
          }
        }),
        prisma.announcement.count({
          where: {
            flags: {
              some: {}
            }
          }
        })
      ])
    ]);

    res.status(200).json({
      flaggedContent: {
        messages: flaggedMessages,
        announcements: flaggedAnnouncements
      },
      statistics: {
        totalFlaggedMessages: moderationStats[0],
        totalFlaggedAnnouncements: moderationStats[1],
        statusDistribution: moderationStats[2]
      },
      history: moderationHistory,
      pagination: {
        page,
        limit: take,
        totalPages: Math.ceil(
          (moderationStats[0] + moderationStats[1]) / take
        ),
        totalItems: moderationStats[0] + moderationStats[1]
      }
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve content moderation data",
      details: error.message
    });
  }
}

// Export all functions
module.exports = {
  getDashboardOverview,
  getUserAnalytics,
  getGroupAnalytics,
  getMeetingAnalytics,
  getSystemHealth,
  getAuditLogs,
  getContentModeration
};
