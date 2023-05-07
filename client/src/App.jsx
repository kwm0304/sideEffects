import { useState } from 'react'
import './App.css'

function App() {
  const [medications, setMedications] = useState([''])
  const [results, setResults] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const searchPromises = medications.map(medication => (
      fetch(`https://api.fda.gov/drug/event.json?search=patient.drug.openfda.substance_name:${medication}&count=patient.reaction.reactionmeddrapt.exact`)
        .then(res => res.json())
    ))
    const results = await Promise.all(searchPromises)
    setResults(results.flatMap(result => result.results))
  }

  const handleAddMedication = () => {
    setMedications([...medications, ''])
  }

  const handleMedicationChange = (index, value) => {
    setMedications(prevState => {
      const newState = [...prevState]
      newState[index] = value
      return newState
    })
  }

  const sum = results.reduce((acc, cur) => acc + cur.count, 0)

  return (
    <section className='bg-blue-950 text-white'>
      <form onSubmit={handleSubmit} >
        {medications.map((medication, index) => (
          <div key={index} className='py-4'>
            <label className=''>Medication {index + 1} </label>
            <input type='text' className='rounded-lg text-blue-950' value={medication} onChange={(e) => handleMedicationChange(index, e.target.value)}/> 
          </div>
        ))}
        <div className="flex flex-row gap-4 py-2 justify-center text-blue-950">
          <button type='button' className='border-2 border-solid border-white w-auto p-1 rounded-lg bg-blue-100 px-2' onClick={handleAddMedication}>Add Medication</button>
          <button type='submit' className='border-2 border-solid border-white w-auto p-1 rounded-lg bg-blue-100 px-2'>Submit</button>
        </div>
      </form>
      <div className="container grid grid-cols">
        <ul>
          {results.length > 0 ? results.map((result, index) => {
            const percent = ((result.count / sum)*100).toFixed(2);
            return (
            <li key={index}>
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
