import React, { useState, useEffect, useCallback } from 'react';
import { View, Text } from 'react-native';

const TimerComponent = React.memo(({ formatTime }) => {
  console.log("Rendering TimerComponent");
  return (
    <Text>
      {formatTime()} {/* Display the formatted time */}
    </Text>
  );
});
export default TimerComponent;