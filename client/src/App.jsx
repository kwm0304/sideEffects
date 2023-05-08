//TODO: Add error handling if fetch fails
//If fetch fails, submit btn gets stuck on loading... 
import { useState } from 'react'
import './App.css'
import { PieChart } from 'react-minimal-pie-chart'

function App() {
  const [medications, setMedications] = useState([''])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [subname, setSubname] = useState(null)

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

  // Set the base URL for the RxNav API
  const baseUrl = 'https://rxnav.nlm.nih.gov/REST/';
  async function getMedicationByGenericName(name) {
    const url = `${baseUrl}drugs.json?name=${name}&search=2`;
    console.log('url', url)
    const response = await fetch(url);
    const data = await response.json();
    const med = data.drugGroup.conceptGroup[1].conceptProperties[0];
    console.log('med', {med})
    setSubname(med.name)
    return {
      name: med.name,
      rxNormId: med.rxcui,
      synonyms: med.synonym
    };
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const results = []
    for (const medication of medications) {
      try {
      const res = await fetch(`https://api.fda.gov/drug/event.json?search=patient.drug.openfda.substance_name:${medication}&count=patient.reaction.reactionmeddrapt.exact`)
      const data = await res.json()
      const countResults = data.results
      const totalCount = countResults.reduce((acc, cur) => acc + cur.count, 0) 
      
      const percentageResults = countResults.map((result) => {
        return {
          title: result.term,
          value: result.count,
          percentage: (result.count / totalCount) * 100
        }
      })
      results.push(...percentageResults)
      console.log('DATA', data)
    } catch (error) {
      console.log('Error', error)
      getMedicationByGenericName(medication)
    }
    setLoading(false)
    const uniqueResults = Array.from(new Set(results.map(result => result.title))).map(title => {
      const filteredResults = results.filter(result => result.title === title)
      console.log('filteredResults', filteredResults)
      console.log('typeOf', typeof filteredResults)
      
      const randomColor = Math.floor(Math.random()*16777215).toString(16);
      const totalCount = filteredResults.reduce((acc, cur) => acc + cur.value, 0)
      const percentage = totalCount !== 0 ? (totalCount / results.reduce((acc, cur) => acc + cur.value, 0)) * 100 : 0;
      console.log('FRVALUE', filteredResults[0].value)
      console.log('totalCount', totalCount)
      console.log('percentageType',typeof percentage)
      return {
        title: title,
        color:'#' + randomColor,
        value: totalCount,
        toolTip: title
      }
    }).slice(0, 20)
    setResults(orderByPercentage(uniqueResults))
    setData(uniqueResults)
    console.log('uniqueResults', uniqueResults)
  }
  }
  const reset = () => {
    setMedications([''])
    setResults([])
    setLoading(false)
    setData([])
  }

  const orderByPercentage = (results) => {
    return results.sort((a, b) => b.count - a.count)
  }

  const sum = results ? results.reduce((acc, cur) => acc + cur.value, 0) : 0

  const defaultLabelStyle = {
    fontSize: '1.5px',
    fontFamily: 'sans-serif',
    fill: 'white'
  }

  return (
    <section className="bg-blue-950 text-white">
      <h1 className='text-4xl font-semibold pt-6'>Side <span className='font-bold text-4xl text-amber-600'>FX</span></h1>
      <h3 className='text-white pt-6 pb-12 italic'>Enter the exact name of your medication in the box below. <br/>
      You can add more by clicking 'Add Medication' and can remove them by clicking the trash button.<br/>
      Results limited to top 20 for readability.
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="py-4">
          {medications.map((medication, index) => (
            <div key={index} className='py-2'>
              <label htmlFor='medication'>Medication #{index + 1} </label>
              <input
                type="text"
                className="rounded-lg text-blue-950 p-1"
                value={medication}
                onChange={(e) => handleMedicationChange(e, index)}
                required
              />
              <button type="button" onClick={() => handleRemoveMedication(index)} className='pl-6 '>
              <i className='fa-solid fa-trash text-white  rounded-full hover:scale-125 hover:outline hover:outline-amber-600 hover:outline-offset-4' />
              </button>
            </div>
          ))}
        </div>
        {subname ? <div>No results for that term, could you have meant {subname}?</div> : ''}
        <div className="font-bold text-amber-600 text-2xl pb-2">Total Number of Reports: <span className='text-white'>{sum}</span></div>
        <div className="flex flex-row gap-4 py-2 justify-center text-blue-950">
          <button type="button" onClick={handleAddMedication} className='hover:scale-110 text-white w-auto py-2 rounded-lg bg-amber-600 px-4'>
            Add Medication
          </button>
          <button type="submit" className="hover:scale-110 text-white w-auto py-2 rounded-lg bg-amber-600 px-4">
            {loading ? 'Loading...' : 'Submit'}
          </button>
        </div>
        {results.length > 0 && (
        <button className=' hover:scale-110 text-white w-auto py-2 rounded-lg bg-amber-600 px-4 w-32' onClick={reset}>Reset</button>
        )}
      </form>
      <div>
        {data ? 
        <PieChart 
        data={data} 
        label={({ dataEntry }) => `${Math.round(dataEntry.percentage)} %  ${dataEntry.title}`} 
        labelStyle={defaultLabelStyle} 
        startAngle={90}
        labelPosition={75}
        totalValue={sum}
        toolTip={({dataEntry}) => `${dataEntry.title}`}
        className='text-white scale-75 text-xs'/>
        :
        <p>No results</p>}
      </div>
    </section>
  )
}

export default App