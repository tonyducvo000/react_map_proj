const getBrokenCameraData = (cameraData) => {

    var indexes = [], i = -1;
    while ((i = cameraData.indexOf(false, i + 1)) !== -1) {
        indexes.push(i);
    }

    return indexes;
}

export default getBrokenCameraData;