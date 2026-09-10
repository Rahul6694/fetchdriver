import React, {useEffect, useState} from 'react';
import DatePicker from 'react-native-date-picker';
import {View, StyleSheet, Image} from 'react-native';
import {Typography} from './Typography';
import Press from './UI/Press';
import {Colors} from '../Constants/Colors';
import {Fonts} from '../Constants/Fonts';
import SvgIcon from './UI/svg';
import moment from 'moment';
import ErrorBox from './ErrorBox';
import localization from '../Constants/localization';
import { Images } from '../Constants/Images';

const Date_Picker = ({
  onChange = () => {},
  onConfirm = () => {},
  placeholder = 'DD-MM-YYYY',
  title = localization?.personalInfo?.dob,
  selected_date = '',
  error,
  allowFutureDates,
  disablePastDates = false,
  ageRestrict = false,
  // dateValue
}) => {
  const [date, setDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    // Update state with the selected date if provided
    if (selected_date) {
      setDate(new Date(selected_date));
    }
  }, [selected_date]);

  const handleConfirm = selectedDate => {
    setValidationError('');
    setDate(selectedDate);
    setShowPicker(false);
    onConfirm(selectedDate);
  };

  const ageRestriction = ageRestrict
    ? moment().subtract(18, 'years').toDate()
    : allowFutureDates
    ? null
    : new Date(date);


    console.log(ageRestriction,"ageRestriction");
  return (
    <View style={{marginTop: 18, marginBottom: 3}}>
      {title && <Typography style={styles?.textStyle}>{title}</Typography>}
      <Press
        style={[styles.container, {borderColor: Colors?.differentGrey}]}
        onPress={() => {
          setShowPicker(true);
        }}>
        <Typography
          style={styles.label}
          color={date ? Colors?.black : Colors?.lightGrey}>
          {date ? moment(date).format('DD-MM-YYYY') : placeholder}
        </Typography>
        <View style={{marginRight: 5}}>
          {/* <SvgIcon name={'calender'} /> */}
          <Image source={Images?.Calendar} style={{width:25,height:25}}/>
        </View>
      </Press>
      {showPicker && (
        <View style={styles?.datePickerContainer}>
          <DatePicker
            mode="date"
            title={localization?.modals?.date}
            cancelText={localization?.modals?.cancel}
            confirmText={localization?.modals?.confirm}
            modal
            open={showPicker}
            date={date || ageRestriction || new Date()}
            minimumDate={disablePastDates ? new Date() : undefined}
            maximumDate={ageRestriction}
            onConfirm={handleConfirm}
            onCancel={() => setShowPicker(false)}
            onChange={onChange}
            locale={localization.lang.lang}
          />
        </View>
      )}
      <ErrorBox message={validationError || error} color={'red'} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 5,
    backgroundColor: Colors.white,
    borderWidth: 1,
    height: 52,
  },
  label: {
    fontSize: 14,
    fontFamily: Fonts?.Inter_Medium,
    paddingLeft: 15,
  },
  datePickerContainer: {
    alignItems: 'center',
  },
  textStyle: {
    color: Colors.lableColor,
    fontSize: 14,
    fontFamily: Fonts?.Inter_Medium,
    marginBottom: 6,
  },
});

export default Date_Picker;
