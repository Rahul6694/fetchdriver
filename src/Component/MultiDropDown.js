import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Modal,
  FlatList,
} from 'react-native';
// import {Typography} from './Typography';
import { Fonts } from '../Constants/Fonts';
import { FULL_WIDTH } from '../Constants/Layout';
import { Colors } from '../Constants/Colors';
import SvgIcon from './UI/svg';
import ErrorBox from './ErrorBox';
import localization from '../Constants/localization';
import Typography from './UI/Typography';

const ta = [];
const MultiDropDown = ({
  data = ta,
  placeholder = 'Select item',
  value = [],
  onChange,
  error,
  title = 'ooo',
  asterick = false,
}) => {
  const [selected, setSelected] = useState(value);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    setSelected(value)
  }, [value])


  const renderItem = ({ item }) => {
    const findIndex = selected?.findIndex(data => data === item?.value);
    return (
      <TouchableOpacity
        style={[
          styles.item,
          {
            backgroundColor: findIndex >= 0 ? '#f5f5f0' : Colors?.Primary,
          },
        ]}
        onPress={() => {
          const newSelected =
            findIndex >= 0
              ? selected.filter(id => id !== item?.value)
              : [...selected, item?.value];
          setSelected(newSelected);
          onChange(
            newSelected
              .map(id => {
                const selectedItem = data.find(
                  dataItem => dataItem?.value === id,
                );
                if (selectedItem) {
                  return { value: id, label: selectedItem?.label };
                } else {
                  return null;
                }
              })
              .filter(selectedItem => selectedItem !== null),
          );
        }}>
        <Typography
          color={'black'}
          style={styles?.textItem}
          fontFamily={Fonts?.Inter_Medium}>
          {item?.label}
        </Typography>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 5,
          marginTop: 18,
        }}>
        <Typography
          color={Colors.inputtitle}
          size={14}
          fontFamily={Fonts?.Inter_Medium}

        >
          {title}
        </Typography>
        {asterick && <Typography color="red">{'*'}</Typography>}
      </View>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: FULL_WIDTH * 0.8,
            height: 52,
          }}>
          <Typography style={styles?.placeholderStyle} numberOfLines={2}>
            {selected?.length > 0
              ? selected
                .map(id => data.find(item => item?.value === id)?.label)
                .join(', ')
              : placeholder}
          </Typography>
          {/* <Icon source={icons?.Downward} size={13} style={{marginLeft: 6}} /> */}
          <SvgIcon name="upDropdown" />
        </View>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={data}
              renderItem={renderItem}
              keyExtractor={item => item?.value}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>{localization?.multiDropDown?.btn}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {!!error && <ErrorBox message={error} style={{ marginTop: 7 }} />}
    </View>
  );
};

export default MultiDropDown;

const styles = StyleSheet.create({
  container: {},
  dropdownButton: {
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: Colors?.LightWhite,
    height: 52,
    backgroundColor: 'white',
  },
  textItem: {
    flex: 1,
  },
  placeholderStyle: {
    fontFamily: Fonts?.Inter_Medium,
    fontSize: 15,
    color: 'black',
    flexShrink: 1,
    paddingLeft: 22,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  item: {
    paddingVertical: 8,
    marginVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: Colors?.black,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: Fonts?.Inter_Medium,
  },
});
