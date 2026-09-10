/** Ride statuses where the driver still has an in-progress booking. */
export const ACTIVE_RIDE_STATUSES = [
  'Confirmed',
  'Driver Assigned',
  'On My Way',
  'On The Spot',
  'Customer in the Car',
];

export const TERMINAL_RIDE_STATUSES = ['Cancelled', 'Completed'];

export const isActiveRideStatus = statusId =>
  ACTIVE_RIDE_STATUSES.includes(statusId);

export const isTerminalRideStatus = statusId =>
  TERMINAL_RIDE_STATUSES.includes(statusId);
