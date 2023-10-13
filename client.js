document.addEventListener('DOMContentLoaded', function () {
  const video = document.getElementById('sharedVideo');
  const socket = io();
  let isMaster = false;

  function updateControls() {
      document.getElementById('makeMasterButton').disabled = isMaster;
  }

  socket.on('master-update', function (data) {
      isMaster = data.isMaster;
      updateControls();
  });

  const makeMasterButton = document.getElementById('makeMasterButton');
  makeMasterButton.addEventListener('click', function () {
      socket.emit('make-master');
  });

  function handlePlay() {
      if (isMaster) {
          socket.emit('play');
      }
  }

  function handlePause() {
      if (isMaster) {
          socket.emit('pause');
      }
  }

  function handleSeek() {
      if (isMaster) {
          socket.emit('seek', video.currentTime);
      }
  }

  socket.on('sync-video', function (data) {
      sharedVideoState = data;
      if (sharedVideoState.isPaused) {
          video.pause();
      } else {
          video.play().catch(function (error) {
              console.error('Error while playing video:', error);
          });
      }
      video.currentTime = sharedVideoState.currentTime;
  });

  video.addEventListener('play', handlePlay);
  video.addEventListener('pause', handlePause);
  video.addEventListener('seeked', handleSeek);

  socket.on('play', function () {
      video.play().catch(function (error) {
          console.error('Error while playing video:', error);
      });
  });

  socket.on('pause', function () {
      video.pause();
  });

  socket.on('seek', function (seekTime) {
      video.currentTime = seekTime;
  });

  socket.on('disconnect', () => {
      console.log('A user disconnected');
  });
});
