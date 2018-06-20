import * as React from 'react';
import * as _ from 'underscore';

import { DailyHours } from '../types';

interface Props {
  hours: DailyHours[];
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const militaryTimeToHumanReadableTime = (militaryTime: string) => {
  let hoursString = militaryTime.slice(0, 2);
  let hours = parseInt(hoursString);
  const ampm = hours > 12 ? 'pm' : 'am';
  if (hoursString === "00") { // Yelp shows 24 as 00.
    hoursString = "12";
  } else if (hours > 12) { // Account for 24 hour clock.
    hours -= 12;
    hoursString = hours.toString();
  } else if (hours < 10) { // Take out extra 0 in front.
    hoursString = hoursString.slice(1).toString();
  }
  // Formatted is an array with: [hours, minutes]
  const formatted = [hoursString, militaryTime.slice(2)];
  return `${formatted.join(':')}${ampm}`;
};

const CoffeeShopHours = ({hours}: Props) =>
  <div className="hours">
    <h3>Hours</h3>
    <div style={{display: 'flex'}}>
      <div style={{marginRight: '16px'}}>
        {_.map(days, day => <div key={day}>{day}</div>)}
      </div>
      <div>
        {_.map(hours, hour =>
          <div key={hour.day}>
            {militaryTimeToHumanReadableTime(hour.start)} - {militaryTimeToHumanReadableTime(hour.end)}
          </div>
        )}
      </div>
    </div>
  </div>

export default CoffeeShopHours;
