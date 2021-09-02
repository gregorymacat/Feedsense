import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import config from '../../../env/config.js';
import Auth from '../Auth.js';
import {Switch, Link} from 'react-router-dom';
import feedExampleData from './feed-example-data.js';
import TwitterFeedTile from './TwitterFeedTile.jsx';
import YouTubeFeedTile from './YouTubeFeedTile.jsx';
import '../../feedStyle.css';
import { useHistory } from 'react-router-dom';
import { useGoogleLogin } from 'react-google-login';
import '../../style.css';
import Modal from '../modals/Modal.jsx';
import axios from 'axios';

var Feed = ({ setIsGoogleSignedIn }) => {
  const [ exampleData, setExampleData ] = useState(feedExampleData);
  const [ youtubeVideos, setYoutubeVideos ] = useState([]);
  const [ showModal, setShowModal ] = useState(false);

  const history = useHistory();

  const {signIn} = useGoogleLogin({
    onSuccess: (res) => {
      console.log(res)
    },
    clientId: config.clientId,
    isSignedIn: true,
    onFailure: (err) => console.log(err),
  })

  var logout = () => {
    Auth.logout(() => {
      history.push('/');
    })
  }

  useEffect(() => {
    signIn()
    setIsGoogleSignedIn(true);

    if(localStorage.access_token) {
      axios.get(`/getYoutube/${localStorage.access_token}`)
        .then(data => {
          setYoutubeVideos(data);
        })
        .catch( err => {
          console.error('ERROR RETRIEVING DATA: ', err.stack);
        });
    }
  }, [])

  return (
    <div>
      <div className='header'>
        <div>
          <h1 >Feedsense</h1>
        </div>
        <div className='navButtonContainer'>
          <Link to='/Analytics/Analytics/dashboard'>Analytics</Link>
          <button onClick={()=>{setShowModal(!showModal)}}>Post a Video</button>
          {showModal ? ReactDOM.createPortal(<Modal show={setShowModal}/>, document.body) : null}
          <a className='logout-btn' onClick={() => {
            setIsGoogleSignedIn(false);
            const auth2 = window.gapi.auth2.getAuthInstance()
            if (auth2 != null) {
              auth2.signOut().then(
                auth2.disconnect()
              )
            }
            localStorage.clear();
            logout();
          }
          }>logout</a>
        </div>
      </div>
      <div>
        {exampleData.map((post, index) => {
          if (post['platform'] === 'youtube') {
            return <YouTubeFeedTile key={index} postData={post}/>
          }
          if (post['platform'] === 'twitter') {
            return <TwitterFeedTile key={index} postData={post}/>
          }
        })}
      </div>
    </div>
  );
}

export default Feed;