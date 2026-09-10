import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import localization from '../../Constants/localization';
import HeaderWithBack from '../../Component/HeaderWithBack';
import {Images} from '../../Constants/Images';
import ContainerView from '../../Component/ContainerView';
import {Fonts} from '../../Constants/Fonts';
import {Colors} from '../../Constants/Colors';
import Typography from '../../Component/UI/Typography';

const Legal = ({navigation}) => {
  const [cmsData, setCmsData] = useState({body: '<p>No content available</p>'});
  const [loading, setLoading] = useState(false);

  const Legals = [
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
      slug: 'Term & Conditions',
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
  ];

  return (
    <ContainerView>
      <HeaderWithBack source={Images.Back} title={localization.Legal.legal} />
      <FlatList
        data={Legals}
        renderItem={({item}) => (
          <>
            <View>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => {
                  navigation.navigate('TermsAndConditions', {
                    slug: item.slug,
                    name: item.name,
                  });
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
                {item?.next && (
                  <TouchableOpacity onPress={() => setIslegal(true)}>
                    <Image source={item.next} style={{height: 16, width: 16}} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      />
    </ContainerView>
  );
};

export default Legal;
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
  separator: {
    alignItems: 'center',
    borderColor: '#ECECEC',
    borderWidth: 0.5,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  image_Container: {
    flexDirection: 'row',
    width: 150,
    justifyContent: 'space-between',
  },
  image: {
    height: 30,
    width: 30,
  },
});
