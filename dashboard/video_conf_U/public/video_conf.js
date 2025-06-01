const peer = new Peer();

const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const incomingCallBox = document.getElementById('incoming-call');
const acceptBtn = document.getElementById('accept-btn');
const declineBtn = document.getElementById('decline-btn');

let localStream;
let currentCall;
let pendingCall;
let currentSender;
let screenStream;

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    localStream = stream;
    localVideo.srcObject = stream;
  })
  .catch(err => {
    console.error('Failed to get local stream:', err);
  });

peer.on('call', call => {
  // Save the call but don't answer yet
  pendingCall = call;
  incomingCallBox.style.display = 'block';
});

acceptBtn.onclick = () => {
  if (pendingCall) {
    pendingCall.answer(localStream);
    pendingCall.on('stream', remoteStream => {
      remoteVideo.srcObject = remoteStream;
    });
    currentCall = pendingCall;
  }
  pendingCall = null;
  incomingCallBox.style.display = 'none';
};

declineBtn.onclick = () => {
  if (pendingCall) {
    pendingCall.close(); // Close the incoming call without answering
  }
  pendingCall = null;
  incomingCallBox.style.display = 'none';
};

document.getElementById('call-btn').onclick = () => {
  const remoteId = document.getElementById('remote-id').value;
  const call = peer.call(remoteId, localStream);
  call.on('stream', remoteStream => {
    remoteVideo.srcObject = remoteStream;
  });
  currentCall = call;
};

document.getElementById('share-screen-btn').onclick = async () => {
  try {
    screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const screenTrack = screenStream.getVideoTracks()[0];
    if (currentCall) {
      currentSender = currentCall.peerConnection.getSenders().find(s => s.track.kind === 'video');
      currentSender.replaceTrack(screenTrack);
    }
    localVideo.srcObject = screenStream;

    screenTrack.onended = () => {
      backToCamera();
    };
  } catch (error) {
    console.error('Failed to share screen:', error);
  }
};

document.getElementById('back-to-camera-btn').onclick = async () => {
  await backToCamera();
};

async function backToCamera() {
  try {
    const webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStream = webcamStream;
    const webcamTrack = webcamStream.getVideoTracks()[0];
    if (currentSender) {
      currentSender.replaceTrack(webcamTrack);
    }
    localVideo.srcObject = webcamStream;

    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
  } catch (error) {
    console.error('Failed to switch back to webcam:', error);
  }
}

let endCallBtn = document.getElementById('endCallBtn');

endCallBtn.addEventListener('click', () => {
    if (peer && !peer.destroyed) {
    peer.destroy();
    console.log('Peer destroyed');
  }
});