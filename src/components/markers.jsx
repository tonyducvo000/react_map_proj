import React, { Component } from 'react';
import { Marker } from 'google-maps-react';
const R = require('ramda');


class Markers extends Component {

    render() {
        const { base_keys_robots, base_values_robots } = this.props

        return (

            <React.Fragment>

                {

                    R.zip(base_keys_robots, base_values_robots).map((data) => {

                        return (
                            <Marker label={data[0]} title={data[0]} onClick={this.parseAndHandleClick}
                                position={{ lat: data[1].location.latitude, lng: data[1].location.longitude }} />
                        )
                    })

                }



            </React.Fragment>


        );
    }
}

export default Markers;