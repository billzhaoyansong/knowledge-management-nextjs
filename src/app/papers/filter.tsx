'use client'

import { redirect } from "next/navigation"
import { useState } from "react"

const Filter = ({ orderBy, searchText, filterLabels, labelsToShow }: {
    orderBy: string,
    searchText: string,
    filterLabels: Set<string>,
    labelsToShow: Set<string>
}) => {

    const [_searchText, setSearchText] = useState(searchText)

    function updateOrderBy(newOrderByValue: string) {

        let params = []

        params.push(`orderBy=${newOrderByValue}`)

        if (!(_searchText === ""))
            params.push(`searchText=${_searchText}`)

        if (filterLabels.size > 0)
            params.push(Array.from(filterLabels).map(l => `labels=${l}`).join('&'))

        redirect(`/papers?${params.join('&')}`)
    }

    function updateSearchText() {

        let params = []

        if (!(_searchText === ""))
            params.push(`searchText=${_searchText}`)

        if (!(orderBy === ""))
            params.push(`orderBy=${orderBy}`)

        if (filterLabels.size > 0)
            params.push(Array.from(filterLabels).map(l => `labels=${l}`).join('&'))

        redirect(`/papers?${params.join('&')}`)
    }

    function updateFilterLabels(label: string) {

        let params = []

        if (!(orderBy === ""))
            params.push(`orderBy=${orderBy}`)

        if (!(_searchText === ""))
            params.push(`searchText=${_searchText}`)

        if (filterLabels.has(label))
            filterLabels.delete(label)
        else
            filterLabels.add(label)

        if (filterLabels.size > 0)
            params.push(Array.from(filterLabels).map(l => `labels=${l}`).join('&'))

        redirect(`/papers?${params.join('&')}`)
    }

    return <div>
        <select name="sortby" id="sortby" className='w-full p-3 bg-yellow-100'
            onChange={(e) => updateOrderBy(e.target.value)}
            defaultValue={orderBy}
        >
            <option value={'date-desc'}>Date Desc</option>
            <option value={'date-asc'}>Date Asc</option>
        </select>

        <div className='pt-6 flex flex-col'>
            <input className='w-full h-7 bg-yellow-100' type="text" value={_searchText}
                placeholder="search text here"
                onChange={(e) => setSearchText(e.target.value)}
                onKeyUp={(e) => {
                    if (e.key === 'Enter')
                        updateSearchText()
                }} />
            <span className="text-xs italic text-slate-400 mt-1">activating search by hitting Enter</span>

            {/* <button className='basis-1/4 text-xs ml-1 p-1 border bg-yellow-100 rounded-md'>Search</button> */}
        </div>

        <div className="flex-initial flex flex-row flex-wrap pt-6">
            {Array.from(labelsToShow).sort().map(l =>
                <div key={l}>
                    <button key={l} className={`text-sm underline mx-1 ${filterLabels.has(l) ? 'font-bold':'font-light'}`}
                        onClick={() => updateFilterLabels(l)}
                    >{filterLabels.has(l) ? `${l}(x)` : l}</button><span className='text-slate-400'>|</span>
                </div>)
            }
        </div>
    </div>
}

export default Filter