import { useEffect, useReducer, useRef } from 'react'
import { noop } from 'lodash'
import { useWeb3React } from '@web3-react/core'
import { useToast } from '../state/hooks'

type Web3Payload = Record<string, unknown> | null

type LoadingState = 'idle' | 'loading' | 'success' | 'fail'

type Action =
  | { type: 'confirm_sending' }
  | { type: 'confirm_receipt'; payload: Web3Payload }
  | { type: 'confirm_error'; payload: Web3Payload }

interface State {
  confirmState: LoadingState
  confirmReceipt: Web3Payload
  confirmError: Web3Payload
}

const initialState: State = {
  confirmState: 'idle',
  confirmReceipt: null,
  confirmError: null,
}

const reducer = (state: State, actions: Action): State => {
  switch (actions.type) {
    
    case 'confirm_sending':
      return {
        ...state,
        confirmState: 'loading',
      }
    case 'confirm_receipt':
      return {
        ...state,
        confirmState: 'success',
        confirmReceipt: actions.payload,
      }
    case 'confirm_error':
      return {
        ...state,
        confirmState: 'fail',
        confirmError: actions.payload,
      }
    default:
      return state
  }
}

type ContractHandler = () => any

interface ConfirmTransaction {
  onConfirm: ContractHandler
  onSuccess: (state: State) => void
}

const useConfirmTransaction = ({
  onConfirm,
  onSuccess = noop,
}: ConfirmTransaction) => {
  const { account } = useWeb3React()
  const [state, dispatch] = useReducer(reducer, initialState)
  const { toastError } = useToast()

  return {
    isConfirming: state.confirmState === 'loading',
    isConfirmed: state.confirmState === 'success',
    confirmReceipt: state.confirmReceipt,
    confirmError: state.confirmError,
    
    handleConfirm: () => {
      onConfirm()
        .on('sending', () => {
          dispatch({ type: 'confirm_sending' })
        })
        .on('receipt', (payload: Web3Payload) => {
          dispatch({ type: 'confirm_receipt', payload })
          onSuccess(state)
        })
        .on('error', (error: Web3Payload) => {
          dispatch({ type: 'confirm_error', payload: error })
          console.error('An error occurred confirming transaction:', error)
          toastError('An error occurred confirming transaction')
        })
    },
  }
}

export default useConfirmTransaction
