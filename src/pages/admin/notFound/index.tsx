import React from 'react'
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className=' p-2 fixed w-full pr-[350px]'>
      
      <div className="flex flex-col items-center justify-center w-full h-[533px] text-center border rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--component-border)' }}>
<div className="text-8xl font-bold text-brand flex items-center gap-4">
<span>404</span>
{/* <span>0</span>
<span>4</span> */}
</div>


<h1 className="text-3xl font-semibold mt-6" style={{ color: 'var(--text-primary)' }}>Page not found</h1>
<p className="mt-2 max-w-md" style={{ color: 'var(--text-secondary)' }}>
Sorry, We can't find the page you are looking for
</p>


<a
onClick={() => navigate('/')}
  className="mt-6 bg-brand text-white px-6 py-3 rounded-xl hover:opacity-90 text-lg transition"
>
Back to home
</a>
</div>
    </div>
  )
}

export default NotFound