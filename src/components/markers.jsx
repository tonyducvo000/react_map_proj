import React from 'react';
import { Marker } from 'google-maps-react';
const R = require('ramda');


const Markers = (base_keys_robots, base_values_robots, parseAndHandleClick) => {

    return (

        R.zip(base_keys_robots, base_values_robots).map((data) => {

            return (
                <Marker key={data[0]} label={data[0]} title={data[0]} onClick={parseAndHandleClick}
                    position={{ lat: data[1].location.latitude, lng: data[1].location.longitude }} />
            )
        })

    );

}

export default Markers;