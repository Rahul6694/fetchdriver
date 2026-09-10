import { StyleSheet, View,ScrollView } from 'react-native'
import React from 'react'
import { CommonView } from '../../Component/CommonView'
import HeaderContent from '../../Component/HeaderContent'
import StatusFlatlist from '../../Component/StatusFlatlist'
import { Typography } from '../../Component/Typography'
import { Colors } from '../../Constants/Colors'
import { Fonts } from '../../Constants/Fonts'
import Button from '../../Component/Button'

const Status = () => {
  return (
    <CommonView>
      <ScrollView keyboardShouldPersistTaps="handled">
          <HeaderContent
            back={true}
            AuthHeader={true}
            title={"Tell us bit more about you."}
            Sub_title={"Choose all that apply to you."}
            onPress={() => navigation.goBack()}
            style_text={styles.header}
          />
          <StatusFlatlist style_view={styles.apply} Data={Snehh}/>
          <Typography size={14} color={Colors.Secondary}>You’ll be able to change your choices at any time from the settings screen.</Typography>
          <Typography size={16} color={Colors.Secondary} fontFamily={Fonts.Roboto_Medium}
          style={styles.optional}>Where Did You Hear About Us? (Optional)</Typography>
          <StatusFlatlist style_view={styles.option} Data={Sneh}/>
          <View style={{flex:1,justifyContent:"flex-end"}}>

          <Button title={"Submit"}/>
          </View>
          </ScrollView>
    </CommonView>
  )
}

export default Status

const styles = StyleSheet.create({
    apply:{
        marginTop:30,
        marginBottom:10
    },
    optional:{
        marginTop:25
    },
    option:{
        marginTop:15
    },
    header:{
      marginTop:20
    },
})

const Snehh = [
    { id: 1, title: "I’m looking for a flat or house share." },
    { id: 2, title: "i have a flat or house share." },
    { id: 3, title: "i’d like to find people to form a new share."}
];

const Sneh = [
    { id: 1, title: "Social Media " },
    { id: 2, title: "Search Engines" },
    { id: 3, title: "Word of Mouth"},
    { id: 4, title: "Paid Ads"},
    { id: 5, title: "Other"}
];