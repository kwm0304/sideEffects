
import { useState } from 'react'
import './App.css'

function App() {
  const [medications, setMedications] = useState([''])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleMedicationChange = (e, index) => {
    const newMedications = [...medications]
    newMedications[index] = e.target.value
    setMedications(newMedications)
    setResults([])
  }

  const handleAddMedication = () => {
    setMedications([...medications, ''])
  }

  const handleRemoveMedication = (index) => {
    const newMedications = [...medications]
    newMedications.splice(index, 1)
    setMedications(newMedications)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const results = []
    for (const medication of medications) {
      const res = await fetch(`https://api.fda.gov/drug/event.json?search=patient.drug.openfda.substance_name:${medication}&count=patient.reaction.reactionmeddrapt.exact`)
      const data = await res.json()
      const countResults = data.results
      const totalCount = countResults.reduce((acc, cur) => acc + cur.count, 0)
      const percentageResults = countResults.map((result) => {
        return {
          term: result.term,
          count: result.count,
          percentage: (result.count / totalCount) * 100,
        }
      })
      results.push(...percentageResults)
    }
    setLoading(false)
    const uniqueResults = Array.from(new Set(results.map(result => result.term))).map(term => {
      const filteredResults = results.filter(result => result.term === term)
      const totalCount = filteredResults.reduce((acc, cur) => acc + cur.count, 0)
      const percentage = (totalCount / results.reduce((acc, cur) => acc + cur.count, 0)) * 100
      return {
        term: term,
        count: totalCount,
        percentage: percentage
      }
    })
    setResults(orderByPercentage(uniqueResults))
  }

  const orderByPercentage = (results) => {
    return results.sort((a, b) => b.count - a.count)
  }

  const sum = results ? results.reduce((acc, cur) => acc + cur.count, 0) : 0
  return (
    <section className="bg-blue-950 text-white">
      <h1 className='text-4xl font-semibold pt-6'>Side <span className='font-bold text-4xl text-amber-600'>FX</span></h1>
      <h3 className='text-white pt-6 pb-12 italic'>Enter the exact name of your medication in the box below. <br/>
      You can add more by clicking 'Add Medication' and can remove them by clicking the trash button.
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="py-4">
          {medications.map((medication, index) => (
            <div key={index} className='py-2'>
              <label>Medication #{index + 1} </label>
              <input
                type="text"
                className="rounded-lg text-blue-950 p-1"
                value={medication}
                onChange={(e) => handleMedicationChange(e, index)}
              />
              <button type="button" onClick={() => handleRemoveMedication(index)} className='pl-6 '>
              <i className='fa-solid fa-trash text-white  rounded-full hover:scale-125 hover:outline hover:outline-amber-600 hover:outline-offset-4' />
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-row gap-4 py-2 justify-center text-blue-950">
          <button type="button" onClick={handleAddMedication} className='hover:scale-110 text-white w-auto py-2 rounded-lg bg-amber-600 px-4'>
            Add Medication
          </button>
          <button type="submit" className="hover:scale-110 text-white w-auto py-2 rounded-lg bg-amber-600 px-4">
            {loading ? 'Loading...' : 'Submit'}
          </button>
        </div>
      </form>
      <div className="container grid grid-cols">
        <ul>
          {results ? (
            results.map((result, index) => {
              return (
                <li key={index}>
                  <p>
                    <span className='text-amber-500 font-semibold'>{result.term}</span> ({result.percentage.toFixed(2)}%)
                  </p>
                </li>
              )
            })
          ) : (
            <p>No results to display</p>
          )}
        </ul>
      </div>
      <div className="grid grid-cols-1 justify-center place-content-center justify-items-center py-4">
        <div className="font-bold text-amber-600 text-2xl">Total Count: <span className='text-white'>{sum}</span></div>
      </div>
    </section>
  )

}

export default App