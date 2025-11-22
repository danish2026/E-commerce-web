import React from 'react'

const NotFound = () => {
  return (
    <div className=' p-7 fixed w-full pr-[350px] mb-[100px]'>
      
      <div className="flex flex-col items-center justify-center w-full h-[700px] bg-white text-center ">
<div className="text-8xl font-bold text-brand flex items-center gap-4">
<span>4</span>
<span>0</span>
<span>4</span>
</div>


<h1 className="text-3xl font-semibold mt-6">Page not found</h1>
<p className="text-gray-500 mt-2 max-w-md">
Sorry, We can’t find the page you are looking for
</p>


<a
href="/"
className="mt-6 bg-brand text-white px-6 py-3 rounded-xl hover:opacity-90 text-lg transition"
>
Back to home
</a>
</div>
    </div>
  )
}

export default NotFound