import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import React, { useState } from 'react';
import HeaderWithBack from '../../Component/HeaderWithBack';
import { Images } from '../../Constants/Images';
import ContainerView from '../../Component/ContainerView';
import { Colors } from '../../Constants/Colors';
import Typography from '../../Component/UI/Typography';
import localization from '../../Constants/localization';
import { Fonts } from '../../Constants/Fonts';

const Support = ({ navigation }) => {
  const [expandedItem, setExpandedItem] = useState(null); // State to manage expanded sections

  const Supports = [
    {
      icon: Images?.about,
      name: localization.Support.aboutUs,
      navigate: 'TermsAndConditions',
      slug: 'about-us',
    },
    {
      icon: Images?.TermsandConditions,
      name: localization.Support.contactUs,
      navigate: 'ContactUs',
    },
    {
      icon: Images?.legal,
      name: localization.Support.legal,
      next: Images?.next,
      subItems: [
        {
          icon: Images?.about,
          name: localization.Legal.copyright,
          navigate: 'CopyRight',
          slug: 'copyright',
        },
        {
          icon: Images?.TermsandConditions,
          name: localization.Legal.termsAndConditions,
          navigate: 'TermsAndConditions',
          slug: 'term-conditions-after',
        },
        {
          icon: Images?.TermsandConditions,
          name: localization.Legal.privacyPolicy,
          navigate: 'PrivacyPolicy',
          slug: 'privacy-policy',
        },
        {
          icon: Images?.DataProviders,
          name: localization.Legal.dataProviders,
          navigate: 'DataProviders',
          slug: 'data-providers',
        },
        {
          icon: Images?.SoftwareLicence,
          name: localization.Legal.softwareLicense,
          navigate: 'SoftwareLicence',
          slug: 'software-licence',
        },
        {
          icon: Images?.location,
          name: localization.Legal.locationInformation,
          navigate: 'LocationInformation',
          slug: 'location-information',
        },
      ],
    },
    {
      icon: Images.FAQ,
      name: localization.multiDropDown.help,
      navigate: 'Faq',
      slug: 'faqs',
    },
  ];

  const handleExpand = item => {
    setExpandedItem(expandedItem === item ? null : item); // Toggle expand/collapse
  };

  return (
    <ContainerView>
      <HeaderWithBack
        source={Images.Back}
        title={localization.Support.support}
      />
      <FlatList
        data={Supports}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => {
                if (item.subItems) {
                  handleExpand(item.name); // Expand/collapse logic
                } else {
                  navigation.navigate(item?.navigate, {
                    slug: item.slug,
                    name: item.name,
                  });
                }
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.iconContainer}>
                  <Image source={item.icon} style={styles.icon} />
                </View>
                <Typography
                  size={16}
                  lineHeight={19}
                  fontFamily={Fonts.Inter_Medium}
                  color={Colors.Black}>
                  {item?.name}
                </Typography>
              </View>
              {item.subItems && (
                <Image
                  source={Images.next}
                  style={{
                    height: 16,
                    width: 16,
                    transform:
                      expandedItem === item.name ? [{ rotate: '90deg' }] : [],
                  }}
                />
              )}
            </TouchableOpacity>
            {expandedItem === item.name && item.subItems && (
              <View style={styles.subMenu}>
                {item.subItems.map((subItem, index) => (
                  <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => {
                      navigation.navigate('TermsAndConditions', {
                        slug: subItem.slug,
                        name: subItem.name,
                      });
                    }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={styles.iconContainer}>
                        <Image source={subItem.icon} style={styles.icon} />
                      </View>
                      <Typography
                        size={16}
                        lineHeight={19}
                        fontFamily={Fonts.Inter_Medium}
                        color={Colors.Black}>
                        {subItem?.name}
                      </Typography>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </ContainerView>
  );
};

export default Support;

const styles = StyleSheet.create({
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
  iconContainer: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: '#E7E9E766',
    marginRight: 16,
  },
  icon: {
    width: 25,
    height: 25,
    tintColor: Colors.Black,
  },
  subMenu: {
    paddingLeft: 50, // Indent sub-items
    backgroundColor: 'white',
  },
  subMenuButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
});
