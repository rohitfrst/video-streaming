document.addEventListener('DOMContentLoaded', function () {
    const video = document.getElementById('sharedVideo');
    const socket = io();
    let isMaster = false;

    function updateControls() {
        document.getElementById('makeMasterButton').disabled = isMaster;
        // if (isMaster) {
        //     video.controls = true;
        // } else {
        //     video.controls = false;
        // }
    }

    socket.on('master-update', function (data) {
        isMaster = data.isMaster;
        updateControls();
    });

    const makeMasterButton = document.getElementById('makeMasterButton');
    makeMasterButton.addEventListener('click', function () {
        socket.emit('make-master');
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });

    video.addEventListener('play', function () {
        if (isMaster) {
            socket.emit('play');
        }
    });

    video.addEventListener('pause', function () {
        if (isMaster) {
            socket.emit('pause');
        }
    });

    video.addEventListener('seeked', function () {
        if (isMaster) {
            socket.emit('seek', video.currentTime);
        }
    });

    socket.on('play', function () {
        try {
            video.play().catch(function (error) {
                console.error('Error while playing video:', error);
            });
        } catch (error) {
            console.error('Error while playing video:', error);
        }
    });

    socket.on('pause', function () {
        try {
            video.pause();
        } catch (error) {
            console.error('Error while pausing video:', error);
        }
    });

    socket.on('seek', function (seekTime) {
        try {
            video.currentTime = seekTime;
        } catch (error) {
            console.error('Error while seeking video:', error);
        }
    });

    socket.on('sync-video', function (data) {
        sharedVideoState = data;
        try {
            if (isMaster) {
                if (data.isPaused) {
                    video.pause();
                } else {
                    video.play();
                }
                video.currentTime = data.currentTime;
            }
        } catch (error) {
            console.error('Error while syncing video:', error);
        }
    });
});
