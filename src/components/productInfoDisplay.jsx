import React from 'react'


const ProductInfoDisplay = (props) => {

    const { orderID, minutesSinceOrdered, orderedItems, subTotal, tax, totalPrice } = props;
    return (
        <React.Fragment>
            <p><b>-------------------------------</b></p>

            <h3>Order Information:</h3>

            <p><b>OrderID: </b>{orderID}</p>

            <p><b>Minutes since order: </b>{minutesSinceOrdered}</p>

            <p><b>Items ordered: </b>{orderedItems}</p>

            <p><b>Subtotal: </b>{subTotal}</p>

            <p><b>Tax: </b>{tax}</p>

            <p><b>Total price: </b>{totalPrice}</p>

        </React.Fragment>

    );
}

export default ProductInfoDisplay;