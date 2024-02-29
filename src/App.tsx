import { useCallback, useEffect, useRef, useState } from "react";

import "./App.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { encodeFunctionData, parseAbi, parseEther } from "viem";

import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  useContractRead,
} from "wagmi";
import {
  usePrepareSendUserOperation,
  useSendUserOperation,
} from "@zerodev/wagmi";

const contractAddress = "0x34bE7f35132E97915633BC1fc020364EA5134863";
const contractABI = parseAbi([
  "function mint(address _to) public",
  "function balanceOf(address owner) external view returns (uint256 balance)",
]);

function App() {
  const { address, isConnected } = useAccount();

  const { config } = usePrepareSendUserOperation({
    to: contractAddress,
    data: encodeFunctionData({
      abi: contractABI,
      functionName: "mint",
      args: [address!],
    }),
    value: BigInt("0"),
  });

  const { sendUserOperation: mint, isLoading } = useSendUserOperation(config);

  const { data: balance = 0, refetch } = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: "balanceOf",
    args: [address!],
  });

  const interval = useRef<any>();

  const handleClick = useCallback(() => {
    if (mint) {
      mint();
      interval.current = setInterval(() => {
        refetch();
      }, 1000);
    }
  }, [mint, refetch]);

  useEffect(() => {
    if (interval.current) {
      clearInterval(interval.current);
    }
  }, [balance, interval]);

  return (
    <div className="App flex justify-center w-screen items-center h-screen flex-col max-md:px-4">
      <div className="w-full mb-10 flex justify-center">
        <ConnectButton showBalance={{ smallScreen: true, largeScreen: true }} />
      </div>

      {isConnected && (
        <>
          <strong style={{ fontSize: "1.5rem" }}>NFT Count</strong>
          <div style={{ fontSize: "1.5rem" }}>{`${balance ?? 0}`}</div>
          <button onClick={handleClick} disabled={isLoading}>
            {isLoading ? "Loading..." : "Mint NFT ->"}
          </button>
        </>
      )}
    </div>
  );
}

export default App;
