import { Fragment, useEffect, useState } from "react"

export interface MultiselectGridOptionInterface {
  text: string
  value: string
  selected: boolean
}

interface MultiSelectGridProps {
  title?: string
  ignoredValue?: string
  options: Array<MultiselectGridOptionInterface>
  onChange: (data: Array<string>) => void
}

function MultiSelectGrid(props: MultiSelectGridProps) {
  const { title, ignoredValue, options, onChange } = props

  const [optionList, setOptionList] = useState<Array<MultiselectGridOptionInterface>>([])

  const select = (index: number) => {
    const newOptions = [...optionList]
    newOptions[index].selected = !newOptions[index].selected
    setOptionList(newOptions)
    onChange(newOptions.filter(option => option.selected).map(option => option.value))
  }

  useEffect(() => {
    setOptionList(options)
  }, [options])

  return (
    <Fragment>
      <div className="box">
        {title !== undefined && <h6 className="title is-size-6">{title}</h6>}
        {optionList.map((option, optionIndex) => (
          <button
            key={optionIndex}
            className={`button is-small m-1 p-2 ${option.selected ? 'is-primary' : 'is-primary-light'}`}
            style={{cursor: 'pointer'}}
            onClick={() => select(optionIndex)}
            type="button"
            disabled={ignoredValue === option.value}
          >
            {option.text}
          </button>
        ))}
        {optionList.length < 1 && (
          <p>-</p>
        )}
      </div>
    </Fragment>
  )
}

export default MultiSelectGrid