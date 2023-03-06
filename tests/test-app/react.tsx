

const button = async () => {
  const state = await someAsyncOp()
  return (
    <p>Some {state}</p>
  )
}

const someButton = (props) => {
  return (
    <p>Some {props.value}</p>
  )
}

const someButtonVanilla = ( ) => {
  let someValue;
  const node = document.getElementById('some-id')
  node?.innerHTML = someValue; 
}
