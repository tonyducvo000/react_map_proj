const getCameraData = (cameraData) => {

    var indexes = [], i = -1;
    while ((i = cameraData.indexOf(false, i + 1)) !== -1) {
        indexes.push(i);
    }

    return indexes;
}

export default getCameraData;