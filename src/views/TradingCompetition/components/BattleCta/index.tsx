import React from 'react'
import styled from 'styled-components'
import {
  Card,
  CardBody,
  Flex,
  LaurelLeftIcon,
  LaurelRightIcon,
  Button,
  CheckmarkCircleIcon,
  useWalletModal,
  useModal,
} from '@pancakeswap-libs/uikit'
import useAuth from 'hooks/useAuth'
import RegisterModal from '../RegisterModal'
import ClaimModal from '../ClaimModal'
import { Heading2Text } from '../CompetitionHeadingText'
import { CompetitionProps } from '../../types'

const StyledCard = styled(Card)`
  display: inline-flex;
  background: linear-gradient(180deg, #D531C9 0%, #452a7a 100%);

  svg {
    margin-bottom: 6px;
    height: 32px;
    width: auto;
    fill: ${({ theme }) => theme.colors.warning};
  }
`

const StyledButton = styled(Button)`
  margin: 16px 20px 0;
  z-index: 200;

  svg {
    margin: 0 4px 0 0;
    height: 20px;
    width: auto;
    fill: ${({ theme }) => theme.colors.textDisabled};
  }
`

const BattleCta: React.FC<CompetitionProps> = ({
  userTradingInformation,
  account,
  isCompetitionLive,
  profile,
  isLoading,
  hasCompetitionFinished,
  onRegisterSuccess,
  onClaimSuccess,
}) => {
  const { login, logout } = useAuth()
  const { onPresentConnectModal } = useWalletModal(login, logout)
  const [onPresentRegisterModal] = useModal(
    <RegisterModal profile={profile} onRegisterSuccess={onRegisterSuccess} />,
    false,
  )
  const [onPresentClaimModal] = useModal(
    <ClaimModal userTradingInformation={userTradingInformation} onClaimSuccess={onClaimSuccess} />,
    false,
  )

  const { hasRegistered, hasUserClaimed, userCakeRewards, userPointReward, canClaimNFT } = userTradingInformation

  const userCanClaimPrizes = !hasUserClaimed && (userCakeRewards !== '0' || userPointReward !== '0' || canClaimNFT)
  const registeredAndNotStarted = hasRegistered && !isCompetitionLive && !hasCompetitionFinished
  const finishedAndPrizesClaimed = hasCompetitionFinished && account && hasUserClaimed
  const finishedAndNothingToClaim = hasCompetitionFinished && account && !userCanClaimPrizes

  const isButtonDisabled = () =>
    isLoading || registeredAndNotStarted || finishedAndPrizesClaimed || finishedAndNothingToClaim

  const getHeadingText = () => {
    // Competition live
    if (isCompetitionLive) {
      return 'Now Live!'
    }
    // Competition finished
    if (hasCompetitionFinished) {
      return 'Finished!'
    }
    // Competition not started
    return 'Starting Soon'
  }

  const getButtonText = () => {
    // No wallet connected
    if (!account) {
      return 'Unlock Wallet'
    }
    // User not registered
    if (!hasRegistered) {
      return 'I want to Battle!'
    }
    // User registered and competition live
    if (isCompetitionLive) {
      return 'Trade Now'
    }

    // User registered and competition finished
    if (hasCompetitionFinished) {
      // User has prizes to claim
      if (userCanClaimPrizes) {
        return 'Claim prizes'
      }
      // User has already claimed prizes
      if (hasUserClaimed) {
        return (
          <>
            <CheckmarkCircleIcon /> {'Prizes Claimed!'}
          </>
        )
      }
      // User has nothing to claim
      return 'Nothing to claim'
    }

    // User registered but competition has not started
    if (!isCompetitionLive) {
      return (
        <>
          <CheckmarkCircleIcon /> {'Registered!'}
        </>
      )
    }

    // May be useful for debugging - if somehow none of the above conditions are met
    return 'Whoopsie'
  }

  const handleCtaClick = () => {
    // All conditions when button isn't disabled

    // No wallet connected
    if (!account) {
      onPresentConnectModal()
    }
    // Wallet connected but user not registered
    if (account && !hasRegistered) {
      onPresentRegisterModal()
    }
    // Registered and competition is live
    if (hasRegistered && isCompetitionLive) {
      window.location.href = 'localhost:30819/#/swap'
    }
    // Registered and competition has finished
    if (hasRegistered && hasCompetitionFinished) {
      onPresentClaimModal()
    }
  }

  return (
    <StyledCard>
      <CardBody>
        <Flex flexDirection="column" justifyContent="center" alignItems="center">
          <Heading2Text>{getHeadingText()}</Heading2Text>
          <Flex alignItems="flex-end">
            <LaurelLeftIcon />
            <StyledButton disabled={isButtonDisabled()} onClick={() => handleCtaClick()}>
              {getButtonText()}
            </StyledButton>
            <LaurelRightIcon />
          </Flex>
        </Flex>
      </CardBody>
    </StyledCard>
  )
}

export default BattleCta
