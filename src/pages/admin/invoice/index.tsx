import { Button } from 'antd';
import React, { useState } from 'react'

const Invoice = () => {
const [count,setCount] = useState(50);

const handleCount = () => {
  setCount(count + 1);
};
const handleDecrement = () => {
  setCount(count - 1);
};

  return (
    <div>
      <Button onClick={handleCount}>Increment</Button>
      <Button onClick={handleDecrement}>decrement</Button>
      <h1>{count}</h1>
    </div>

  )
}

export default Invoice;