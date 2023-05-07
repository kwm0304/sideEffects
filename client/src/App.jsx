import { useState } from 'react'

import './App.css'

function App() {
  const [medication, setMedication] = useState('')
  const [results, setResults] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMedication(medication)
    const res = await fetch (`https://api.fda.gov/drug/event.json?search=patient.drug.openfda.substance_name:${medication}&count=patient.reaction.reactionmeddrapt.exact`)
    const data = await res.json()
    const results = data.results;
    setResults(results)
    console.log('data', data)
    console.log('results', results)
  }
  const sum = results ? results.reduce((acc, cur) => acc + cur.count, 0) : 0;

  
  
  
  return (
    <section className='bg-blue-950 text-white'>
      <form onSubmit={handleSubmit} >
        <div className='py-4'>
          <label className=''>Medication </label>
          <input type='text' className='rounded-lg text-blue-950' onChange={(e) => setMedication(e.target.value)}/> 
        </div>
        <div className="flex flex-row gap-4 py-2 justify-center text-blue-950">
          <button className='border-2 border-solid border-white w-auto p-1 rounded-lg bg-blue-100 px-2'>Add Medication</button>
          <button type='submit' className='border-2 border-solid border-white w-auto p-1 rounded-lg bg-blue-100 px-2'>Submit</button>
        </div>
      </form>
      <div className="container grid grid-cols">
        <ul>
          {results ? results.map((result) => {
            const percent = ((result.count / sum)*100).toFixed(2);
            return (
            <li key={result.term}>
              <p>{result.term} ({percent}%)</p>
            </li>
            )}
            ) : 
          (<p>No results to display</p>)
          }
        </ul>
      </div>
      <div className="grid grid-cols-1 justify-center place-content-center justify-items-center py-4">
          <div className="font-bold">Total Count: {sum} </div>
        </div>
    </section>
  )
}

export default App
