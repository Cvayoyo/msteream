import React from 'react'

const Header = ({title}) => {
  return (
     <div className="text-center my-4">
        <h2 className="text-3xl font-bold mb-1 text-center text-pink-500">{title}</h2>
        <div className="w-24 h-1 bg-pink-500 mx-auto rounded-full"></div>
      </div>
  )
}

export default Header