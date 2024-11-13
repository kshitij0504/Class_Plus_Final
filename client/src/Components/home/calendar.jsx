import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Calendar = ({ events = [], onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [displayedEvents, setDisplayedEvents] = useState([]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      daysInMonth: lastDay.getDate(),
      startingDay: firstDay.getDay()
    };
  };

  useEffect(() => {
    const dateEvents = events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === selectedDate.toDateString();
    });
    setDisplayedEvents(dateEvents);
  }, [selectedDate, events]);

  const handleDateClick = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    onDateSelect?.(newDate);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
  const today = new Date();

  const hasEventOnDate = (day) => {
    const checkDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    ).toDateString();
    return events.some(event => new Date(event.startTime).toDateString() === checkDate);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-white">
            <CalendarIcon className="h-6 w-6" />
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
          {Array.from({ length: 42 }, (_, i) => {
            const day = i - startingDay + 1;
            const isCurrentMonth = day > 0 && day <= daysInMonth;
            const isToday = 
              isCurrentMonth &&
              day === today.getDate() &&
              currentDate.getMonth() === today.getMonth() &&
              currentDate.getFullYear() === today.getFullYear();
            const isSelected = 
              isCurrentMonth &&
              day === selectedDate.getDate() &&
              currentDate.getMonth() === selectedDate.getMonth() &&
              currentDate.getFullYear() === selectedDate.getFullYear();
            const hasEvent = isCurrentMonth && hasEventOnDate(day);

            return (
              <div
                key={i}
                onClick={() => isCurrentMonth && handleDateClick(day)}
                className={`
                  relative p-4 text-center cursor-pointer transition-all
                  ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-gray-100'}
                  ${isSelected ? 'bg-blue-500 text-white rounded-lg shadow-md transform scale-105' : ''}
                  ${isToday && !isSelected ? 'ring-2 ring-blue-500 rounded-lg' : ''}
                  ${isCurrentMonth && !isSelected ? 'hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg' : ''}
                `}
              >
                <span className={`
                  text-sm font-medium
                  ${isSelected ? 'text-white' : ''}
                `}>
                  {isCurrentMonth ? day : ''}
                </span>
                {hasEvent && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className={`
                      h-1.5 w-1.5 rounded-full
                      ${isSelected ? 'bg-white' : 'bg-blue-500'}
                    `}/>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Events for {selectedDate.toLocaleDateString('default', { 
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </h3>
          <div className="space-y-2">
            {displayedEvents.length > 0 ? (
              displayedEvents.map((event, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {event.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(event.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      {event.type || 'Event'}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No events scheduled for this day
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Calendar;