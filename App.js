import React, {Component} from 'react'
import { StyleSheet, ActivityIndicator, View, Text, Dimensions, BackHandler, Alert, Share, Image } from 'react-native'
import { WebView } from 'react-native-webview'

import NetInfo from '@react-native-community/netinfo'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'

var { width, height } = Dimensions.get('window')

export default class App extends Component {
  state = {
    url: 'https://ploughinn.app/',
    splash: true,
    loading: true,
    netState: true,
    canGoBack: false
  }

  componentWillMount(){
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress)
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress)
  }

  componentDidMount(){
    const that = this
    NetInfo.addEventListener(state => {
      that.setState({'netState': state.isConnected})
    })

    setTimeout(function(){
      that.setState({splash: false})
    }, 2000)
  }

  onBackPress = () => {
    console.log('Back pressed')

    if(this.state.canGoBack){
      this.refs.app.goBack()
    }
    else {
      Alert.alert(
      'Exit App',
      'Do you want to exit?',
      [
        {text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'Yes', onPress: () => BackHandler.exitApp()},
      ],
      { cancelable: false })
    }

    return true
  }

  startLoading(){
    this.setState({'loading': true})
  }

  stopLoading(){
    this.setState({'loading': false})
  }

  onNavigationStateChange(navState) {
    console.log(navState)
    this.setState({
      canGoBack: navState.canGoBack
    });
  }

  onMessage(data){
    console.log('in onMessage')
    console.log(JSON.parse(data.nativeEvent.data))

    const event = JSON.parse(data.nativeEvent.data)

    if(event.action == 'share'){
      Share.share({
        title: event.title,
        message: event.message
      })
    }
  }

  render(){  
    let offlineBar = null
    let overlay = null
    let content = <View style={styles.container}>
      <Image source={require('./assets/splash.png')} style={styles.splash} />
     </View>

    if(! this.state.netState){
      offlineBar = <Text style={styles.offlineBar}>No Internet</Text>
      overlay = <View style={styles.overlay}></View>
    }

    if(! this.state.splash){    
      content = <WebView
        ref="app" 
        originWhitelist={['*']}
        source={{ uri: this.state.url }}
        style={styles.webview}

        userAgent="appAndroid"

        scrollEnabled={false}

        onLoadStart={this.startLoading.bind(this)}
        onLoadEnd={this.stopLoading.bind(this)}

        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        setAllowFileAccessFromFileURLs={true}
        setAllowUniversalAccessFromFileURLs={true}

        onMessage={this.onMessage.bind(this)}
        onNavigationStateChange={this.onNavigationStateChange.bind(this)}
      />
    }

    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <ActivityIndicator size="large" color="#f1c761" 
            animating={this.state.loading}
            style={styles.loader}
          />
          {offlineBar}
          {content}

          {overlay}
        </SafeAreaView>
      </SafeAreaProvider>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    // paddingTop: 25,
    flex: 1,
    // alignItems: 'center',
    justifyContent: 'center',
  },
  bg: {
    alignSelf: 'flex-start',
    position: 'absolute',
    flex: 1,
    width: width,
    height: height,
    resizeMode: 'stretch',
    // zIndex: 10,
  },
  splash: {
    width: width,
    height: height,
    flex: 1,
    resizeMode: 'contain'
  },
  loader: {
    position: 'absolute',
    zIndex: 10,
    alignSelf: 'center'
  },
  offlineBar: {
    alignContent: 'center',
    backgroundColor: 'red',
    color: 'white',
    padding: 10,
    zIndex: 10
  },
  webview: { 
    flex: 1
  },
  overlay: {
    zIndex: 5,
    flex: 1,
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0.5,
    backgroundColor: 'black',
    width: width,
    height: height+500
  } 
})

