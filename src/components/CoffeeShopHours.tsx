import * as React from 'react';
import * as _ from 'underscore';

import { DailyHours } from '../types';

interface Props {
  hours: DailyHours[];
}

const indexToHumanReadableDay: {[key: string]: string} = {
  0: 'Mon',
  1: 'Tue',
  2: 'Wed',
  3: 'Thu',
  4: 'Fri',
  5: 'Sat',
  6: 'Sun',
};

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
    {_.map(hours, hour =>
      <div>
        {indexToHumanReadableDay[hour.day]}
        {militaryTimeToHumanReadableTime(hour.start)} - {militaryTimeToHumanReadableTime(hour.end)}
      </div>
    )}
  </div>

export default CoffeeShopHours;
