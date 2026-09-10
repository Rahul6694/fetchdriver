import {
  FlatList,
  Image,
  Platform,
  StyleSheet, TouchableOpacity,
  View
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Typography from '../../Component/UI/Typography';
import { Fonts } from '../../Constants/Fonts';
import { CommonView } from '../../Component/CommonView';
import { Colors } from '../../Constants/Colors';
import { Images } from '../../Constants/Images';
import Button from '../../Component/Button';
import localization from '../../Constants/localization';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../../Constants/AsyncStorage';
import { langCode } from '../../Redux/action';
import { GET_WITH_TOKEN } from '../../Backend/Backend';
import { UPDATE_LANGUAGE } from '../../Backend/ApiRoutes';
import HeaderWithBack from '../../Component/HeaderWithBack';

const ChangeLanguage = ({ navigation }) => {
  const master_data = useSelector(store => store.master_data);
  const [language, setLanguages] = useState([]);

  console.log(master_data?.languages, "master_data?.languages===================>")

  useEffect(() => {
    const languageMapping = {
      en: Images.englishLang,
      fr: Images.FrenchLang,
      pt: Images.PortugueseLang,
      de: Images.GermanLang,
      es: Images.SpanishLang,
      zh: Images.MandarinLang,
    };

    const updatedLanguages = master_data?.languages?.map(language => ({
      ...language,
      img: languageMapping[language.lang_code] || null,
    }));
    setLanguages(updatedLanguages);
  }, [master_data?.languages])


  const lang = localization?.getLanguage();
  const dispatch = useDispatch();

  // const language = [
  //   {
  //     id: 1,
  //     // name: localization.Choose_Your_Language?.english,
  //     name: 'English',
  //     img: Images?.englishLang,
  //     slug: 'en',
  //   },
  //   {
  //     id: 2,
  //     // name: localization.Choose_Your_Language?.french,
  //     name: 'française',
  //     img: Images?.FrenchLang,
  //     slug: 'fr',
  //   },
  //   {
  //     id: 3,
  //     // name: localization.Choose_Your_Language?.portuguese,
  //     name: 'português',
  //     img: Images?.PortugueseLang,
  //     slug: 'pt',
  //   },
  //   {
  //     id: 4,
  //     // name: localization.Choose_Your_Language?.german,
  //     name: 'Deutsch',
  //     img: Images?.GermanLang,
  //     slug: 'de',
  //   },
  //   {
  //     id: 5,
  //     // name: localization.Choose_Your_Language?.spanish,
  //     name: 'española',
  //     img: Images?.SpanishLang,
  //     slug: 'es',
  //   },
  //   {
  //     id: 6,
  //     // name: localization.Choose_Your_Language?.mandarin,
  //     name: '普通话',
  //     img: Images?.MandarinLang,
  //     slug: 'zh',
  //   },
  // ];

  const [selectedLang, setSelectedLang] = useState({ lang_code: lang || 'en' });

  const changes = async () => {
    await localization?.setLanguage(selectedLang?.lang_code);
  };


  const handleSubmit = () => {
    changes();
    setLanguage(selectedLang?.lang_code);
    dispatch(langCode(selectedLang?.lang_code));
    navigation?.goBack();
    GET_WITH_TOKEN(
      `${UPDATE_LANGUAGE}/${selectedLang?.id}`,
      SUCCESS => {
        console.log(SUCCESS, '==>GET profile SUCCESS');
      },
      ERROR => {
        console.log(ERROR, '==>GET profile ERROR');
      },
      FAIL => {
        console.log(FAIL, '==>GET profile FAIL');
      },
    );

  };

  useEffect(() => {
    changes();
  }, [selectedLang]);

  return (
    <CommonView AuthImg={Images?.choose_language}>
      <View
        style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <View
          style={{
            width: '95%',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: Platform?.OS == 'ios' ? -40 : -10
          }}>
          <HeaderWithBack
            source={Images.Back}
            title={localization.Choose_Your_Language?.chooseLanguage}
          />
        </View>
      </View>
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
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedLang(item);

                  localization?.setLanguage(item?.lang_code);
                  setLanguage(item?.lang_code);
                  dispatch(langCode(item?.lang_code));
                }}
                style={[
                  styles.langView,
                  {
                    marginLeft: index % 2 === 0 ? 0 : 20,
                    borderColor:
                      selectedLang && selectedLang.lang_code === item?.lang_code
                        ? Colors?.selectedBorderColor
                        : Colors?.borderColor,
                    borderWidth: selectedLang && selectedLang.lang_code === item?.lang_code ? 2 : 1,
                  },
                ]}>
                {
                  console.log(item?.img, "item?.im==============>")
                }
                <Image source={item?.img} style={{ width: 36, height: 36, borderRadius: 20, resizeMode: "cover" }} />
                <Typography style={styles?.langText}>{item?.title}</Typography>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
            numColumns={2}
            removeClippedSubviews={false}
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

export default ChangeLanguage;

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
