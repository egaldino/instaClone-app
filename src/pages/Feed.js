import React, { Component } from 'react';
import { View, Image, TouchableOpacity, FlatList, Text,StyleSheet } from 'react-native';
import io from 'socket.io-client';

import api from '../services/api';
import apiConfig from '../config/api.json';


import camera from '../images/camera.png';
import more from '../images/more.png';
import like from '../images/like.png';
import comment from '../images/comment.png';
import send from '../images/send.png';

export default class Feed extends Component {
  
  static navigationOptions = ({navigation}) => ({
      headerRight: (
       <TouchableOpacity style={{marginRight: 20}} onPress={() => navigation.navigate('New')}>
            <Image source={camera}/>
       </TouchableOpacity>   
      )
  });

   state = {
    feed: []
  }

  registerToSocket = () => {
    const socket = io(apiConfig.connectionUrl);

    socket.on('post', newPost => {
      this.setState({feed: [newPost, ...this.state.feed]});
    });

    socket.on('like', likedPost => {
      this.setState({feed: this.state.feed.map(post => post._id === likedPost._id ? likedPost : post)});
    });
  }

  handleLike = id => api.post(`/posts/${id}/like`);

  async componentDidMount(){
    const response = await api.get('posts');

    this.setState({feed: response.data})

    this.registerToSocket();
  }
  
  
  render() {
    return (<View style={styles.container}>
        <FlatList 
            data={this.state.feed}
            keyExtractor={post => post._id}
            renderItem={({item}) => (
                <View style={styles.feedItem}>
                    <View style={styles.feedItemHeader}>
                        <View style={styles.userInfo}>
                            <Text style={styles.name}>{item.author}</Text>
                            <Text style={styles.place}>{item.place}</Text>
                        </View>

                        <Image source={more} />  
                    </View>
                
                    <Image style={styles.feedImage} source={{uri: `${apiConfig.connectionUrl}/files/${item.image}`}} />
                    
                    <View style={styles.feedItemFooter}>
                        <View style={styles.actions}>
                            <TouchableOpacity style={styles.action} onPress={() => this.handleLike(item._id)}>
                                    <Image source={like}/>
                            </TouchableOpacity>   
                            <TouchableOpacity style={styles.action} onPress={() => false}>
                                    <Image source={comment}/>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.action} onPress={() => false}>
                                    <Image source={send}/>
                            </TouchableOpacity>   
                        </View>
                        <Text style={styles.likes}>{item.likes} curtidas</Text>
                        <Text style={styles.description}>{item.description}</Text>
                        <Text style={styles.hashtags}>{item.hashtags}</Text>
                    </View>
                
                </View>
            )}
        />
    
    </View>);
  }
}

const styles = StyleSheet.create({
    container:{
        flex: 1
    },
    feedItem: {
        marginTop: 20
    },
    feedItemHeader: {
        paddingHorizontal: 15,

        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    name: {
        fontSize: 14,
        color: '#000'
    },
    place: {
        fontSize: 12,
        color: '#666',
        marginTop: 2
    },
    feedImage: {
        width: '100%',
        height: 400,
        marginVertical: 15
    },
    feedItemFooter: {
        paddingHorizontal: 15,
    },
    actions: {
        flexDirection: 'row'
    },
    action: {
        margin: 8
    },
    likes: {
        marginTop: 15,
        fontWeight: 'bold',
        color: '#000'
    },
    description: {
        lineHeight: 18,
        color: '#000'
    },
    hashtags: {
        color: '#7159c1'
    }
});
