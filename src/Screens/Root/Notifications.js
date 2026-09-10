import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import React from 'react';
import { Images } from '../../Constants/Images';
import Typography from '../../Component/UI/Typography';
import { Fonts } from '../../Constants/Fonts';
import { Colors } from '../../Constants/Colors';
import { windowWidth } from '../../Constants/Dimensions';
import localization from '../../Constants/localization';
import { openSettings } from 'react-native-permissions';
import ContainerView from '../../Component/ContainerView';
import HeaderWithBack from '../../Component/HeaderWithBack';


const Notifications = () => {
  // Sample data for notifications
  const Today = [
    {
      title: "5% Special Discount!",
      description: "Lorem ipsum dolor sit amet consectetur. Ultrici es tincidunt eleifend vitae",
      source: Images.letter
    },
    {
      title: "Booking cancelled",
      description: "Lorem ipsum dolor sit amet consectetur. Ultrici es tincidunt eleifend vitae",
      source: Images.letter
    },
    {
      title: "Booking Confirmed",
      description: "Lorem ipsum dolor sit amet consectetur. Ultrici es tincidunt eleifend vitae",
      source: Images.letter
    }
  ];


  const Yesterday = [
    {
      title: "Your Driver Is On The Way",
      description: "Lorem ipsum dolor sit amet consectetur. Ultrici es tincidunt eleifend vitae",
      source: Images.letter
    },
    {
      title: "Payment Successfully!",
      description: "Lorem ipsum dolor sit amet consectetur. Ultrici es tincidunt eleifend vitae",
      source: Images.letter
    },
    {
      title: "Booking Confirmed",
      description: "Lorem ipsum dolor sit amet consectetur. Ultrici es tincidunt eleifend vitae",
      source: Images.letter
    },
    {
      title: "Payment Successfully!",
      description: "Lorem ipsum dolor sit amet consectetur. Ultrici es tincidunt eleifend vitae",
      source: Images.letter
    }
  ];


  const renderToday = ({ item }) => (
    <TouchableOpacity style={styles.notificationCard}>
        <View style={styles.iconContainer}>
          <Image source={item.source} style={styles.icon} />
        </View>
        <View style={{ width: windowWidth/2+80,}}>
        <Typography fontFamily={Fonts.Inter_SemiBold} size={16} lineHeight={19.36} color={Colors.Black}>{item.title}</Typography>
        <Typography lineHeight={22} size={14}>{item.description}</Typography>
        </View>
    </TouchableOpacity>
  );

  return (
    <ContainerView>
      <HeaderWithBack title={localization?.MyAccount.messages} source={Images.Back} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{marginBottom: 20}}>
      <Typography size={18} fontFamily={Fonts.Inter_SemiBold} color={Colors.Black} style={styles.text}>Today</Typography>
      <FlatList
        data={Today}
        renderItem={renderToday} />
        <Typography size={18} fontFamily={Fonts.Inter_SemiBold} color={Colors.Black} style={styles.text}>Yesterday </Typography>
        <FlatList
        data={Yesterday}
        renderItem={renderToday} />
        </View>
      </ScrollView>
    </ContainerView>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  notificationCard: {
    paddingVertical: 20,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor
  },
  iconContainer: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    backgroundColor: Colors.bg_grey,
    marginRight: 15
  },
  icon: {
    width: 25.50,
    height: 25,
    tintColor: Colors.Black,
  },
  text:{
    marginVertical: 20
  }
});
