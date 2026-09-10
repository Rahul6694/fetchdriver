import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  AppState,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Typography from '../../Component/UI/Typography';
import { Fonts } from '../../Constants/Fonts';
import { CommonView } from '../../Component/CommonView';
import { Colors } from '../../Constants/Colors';
import ContainerView from '../../Component/ContainerView';
import { Images } from '../../Constants/Images';
import Button from '../../Component/Button';
import localization from '../../Constants/localization';
import { useDispatch } from 'react-redux';
import { isChooseLanguage } from '../../Redux/action';
import { setLanguage } from '../../Constants/AsyncStorage';

const SeletLanguage = ({ navigation }) => {
  const lang = localization?.getLanguage();
  const dispatch = useDispatch();

  const language = [
    {
      id: 1,
      name: 'English',
      img: Images?.englishLang,
      slug: 'en',
    },
  ];

  const [selectedLang, setSelectedLang] = useState(lang || 'en');

  const changes = async () => {
    await localization?.setLanguage(selectedLang);
  };
  
  const handleSubmit = () => {
    changes();
    setLanguage(selectedLang);
    dispatch(isChooseLanguage(true));
    navigation?.navigate('Login');
  };

  useEffect(() => {
    changes();
  }, [selectedLang]);



  return (
    <CommonView AuthImg={Images?.choose_language} scrollEnabled={false}>
      <View
        style={{
          flex: 0.35,
          justifyContent: 'center',
          alignItems: 'center',
        }}></View>
      <View style={styles.bottomView} key={selectedLang || lang}>
        <Typography style={styles.bottomText}>
          {localization.Choose_Your_Language?.chooseLanguage}
        </Typography>
        <View style={{ paddingTop: 10 }}>
          <FlatList
            data={language}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedLang(item?.slug);
                    localization?.setLanguage(item?.slug);
                  }}
                  style={[
                    styles.langView,
                    {
                      marginLeft: index % 2 === 0 ? 0 : 20,
                      borderColor:
                        selectedLang === item?.slug
                          ? Colors?.selectedBorderColor
                          : Colors?.borderColor,
                      borderWidth: selectedLang === item?.slug ? 2 : 1,
                    },
                  ]}>
                  <Image source={item?.img} style={{ width: 36, height: 36 }} />

                  <Typography style={styles?.langText}>
                    {item?.name}
                  </Typography>
                </TouchableOpacity>
              );
            }}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
          />
        </View>
      </View>
      <View style={{ bottom: 0, paddingHorizontal: 20 }}>
        <Button
          title={localization.Choose_Your_Language?.continue}
          onPress={() => {
            handleSubmit();
          }}
          style_button={{ backgroundColor: Colors?.Black }}
        />
      </View>
    </CommonView>
  );
};

export default SeletLanguage;

const styles = StyleSheet.create({
  bottomView: {
    flex: 0.65,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  bottomText: {
    color: Colors?.Black,
    fontSize: 20,
    fontFamily: Fonts?.Inter_Bold,
  },
  langText: {
    color: Colors?.Black,
    fontSize: 16,
    fontFamily: Fonts?.Inter_SemiBold,
    marginTop: 10,
  },
  langView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 25,
    marginTop: 20,
    justifyContent: 'space-between',
    width: '80%',
  },
});
