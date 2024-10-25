import { StreamChat } from 'stream-chat';
import { connect } from 'getstream';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const streamClient = connect(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

const chatClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

class MeetingService {
  static generateToken(userId) {
    return streamClient.createUserToken(userId);
  }

  static async createMeeting(meetingData) {
    const { title, hostId, scheduledAt, duration } = meetingData;
    
    // Generate a unique meeting ID
    const meetingId = crypto.randomBytes(16).toString('hex');
    
    // Create a new channel for the meeting
    const channel = chatClient.channel('meeting', meetingId, {
      name: title,
      created_by_id: hostId,
      members: [hostId],
      scheduled_at: scheduledAt,
      duration: duration,
      meeting_status: 'scheduled'
    });

    await channel.create();

    // Generate meeting access token
    const meetingToken = crypto
      .createHash('sha256')
      .update(`${meetingId}-${process.env.MEETING_SECRET}`)
      .digest('hex');

    return {
      meetingId,
      channelId: channel.id,
      meetingToken,
      title,
      scheduledAt,
      duration
    };
  }

  static async joinMeeting(meetingId, userId, meetingToken) {
    // Verify meeting token
    const expectedToken = crypto
      .createHash('sha256')
      .update(`${meetingId}-${process.env.MEETING_SECRET}`)
      .digest('hex');

    if (meetingToken !== expectedToken) {
      throw new Error('Invalid meeting token');
    }

    const channel = chatClient.channel('meeting', meetingId);
    await channel.addMembers([userId]);

    return {
      channelId: channel.id,
      streamToken: this.generateToken(userId)
    };
  }

  static async endMeeting(meetingId, hostId) {
    const channel = chatClient.channel('meeting', meetingId);
    const channelData = await channel.query();

    if (channelData.channel.created_by_id !== hostId) {
      throw new Error('Only the host can end the meeting');
    }

    await channel.update({ meeting_status: 'ended' });
    await channel.stopWatching();
  }
}

export default MeetingService;