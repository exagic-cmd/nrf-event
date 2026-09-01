import React from 'react'

function TabsNavigations({ tabs, onTabClick }) {
  return (
 <>
   {/* Tabs navigation */}
   <div className="border-b border-border">
   <div className="flex overflow-x-auto">
     {tabs.map((tab) => (
       <button
         key={tab}
         className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
            onTabClick === tab
             ? 'text-blue-600 border-b-2 border-blue-600'
             : 'text-muted-foreground hover:text-muted-foreground'
         }`}
         onClick={() => onTabClick(tab)}
       >
         {tab}
       </button>
     ))}
   </div>
 </div>
 
 </>
  )
}

export default TabsNavigations