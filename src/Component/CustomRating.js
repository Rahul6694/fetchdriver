import React, { useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Images } from '../Constants/Images';

const CustomRating = ({
    maxRating = 5,
    currentRating = 0,
    onChangeRating = () => { },
    starSize = 40,
    spacing = 8,
    filledStar = Images.StarFilled,
    emptyStar = Images.StarEmpty
}) => {

    const [rating, setRating] = useState(currentRating);


    const handleRatingChange = (newRating) => {

        const newRatingValue = newRating === rating ? newRating - 1 : newRating;

        setRating(newRatingValue);
        onChangeRating(newRatingValue);
    };

    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
        const isFilled = i <= rating;
        stars.push(
            <TouchableOpacity
                key={i}
                activeOpacity={0.6}
                onPress={() => handleRatingChange(i)}
                style={{ marginHorizontal: spacing / 2 }}
                accessibilityLabel={`Rate ${i} star`}
                accessibilityRole="button"
            >
                <Image
                    source={isFilled ? filledStar : emptyStar}
                    style={{ width: starSize, height: starSize, resizeMode: 'contain' }}
                />
            </TouchableOpacity>
        );
    }

    return <View style={styles.row}>{stars}</View>;
};

export default CustomRating;

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
