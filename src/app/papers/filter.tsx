'use client'

import { redirect } from "next/navigation"

const Filter = () => {

    

    return <div>
        <select name="sortby" id="sortby" className='w-full p-3 bg-yellow-100'
            onChange={(e) => redirect(`/papers?orderBy=${e.target.value}`)}
        >
            <option value={'date-desc'}>Date Desc</option>
            <option value={'date-asc'}>Date Asc</option>
        </select>

        <div className='pt-6 flex flex-row'>
            <input className='w-36 h-7 bg-yellow-100' type="text" name="search" id="search" />

            <button className='basis-1/4 text-xs ml-1 p-1 border bg-yellow-100 rounded-md'>Search</button>
        </div>
    </div>
}

export default Filter