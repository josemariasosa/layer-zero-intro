const { ethers } = require("hardhat");
const {Options} = require('@layerzerolabs/lz-v2-utilities');

async function main() {
    const MyOAppSideA = await ethers.getContractFactory("MyOApp");
    const MyOAppSideB = await ethers.getContractFactory("MyOApp");
    const EndpointV2Mock = await ethers.getContractFactory("EndpointV2Mock");

    // const [delegate, peer] = await ethers.getSigners();
    const [delegate] = await ethers.getSigners();
    
    const eid1 = 1;
    const eid2 = 2;
    const endpointA = await EndpointV2Mock.deploy(eid1);
    const endpointB = await EndpointV2Mock.deploy(eid2);

    // console.log(peer.address);
    // console.log(endpoint.address);
    const myoappA = await MyOAppSideA.deploy(endpointA.address, delegate.address);
    const myoappB = await MyOAppSideB.deploy(endpointB.address, delegate.address);

    /// function setDestLzEndpoint(address destAddr, address lzEndpointAddr) external 
    await endpointA.setDestLzEndpoint(myoappB.address, endpointB.address);

    console.log("myoapp version: ", await myoappA.oAppVersion());

    let bytes32AddressB = ethers.utils.hexZeroPad(myoappB.address, 32);
    let bytes32AddressA = ethers.utils.hexZeroPad(myoappA.address, 32);
    // let bytes32Address = ethers.utils.zeroPad(ethers.utils.arrayify(address), 32);
    // let bytes32Address = ethers.zeroPadValue(peer.address, 32); // to the right

    await myoappA.setPeer(eid2, bytes32AddressB); // A trust in B and eid2
    await myoappB.setPeer(eid1, bytes32AddressA);

    console.log("peerB address  : ", myoappB.address);
    console.log("Peer for eid 2: ", await myoappA.peers(eid2));
    console.log("B original message: ", await myoappB.data());

    // Quote
    // uint32 _dstEid,
    // string memory _message,
    // bytes memory _options,
    // bool _payInLzToken
    const GAS_LIMIT = 1000000; // Gas limit for the executor
    const MSG_VALUE = 0; // msg.value for the lzReceive() function on destination in wei
    const _options = Options.newOptions().addExecutorLzReceiveOption(GAS_LIMIT, MSG_VALUE);
    const _message = "Let's go Red Rox!";
    const fee = await myoappA.connect(delegate).quote(eid2, _message, _options.toHex(), false);
    // const fee = await myoappA.connect(delegate).quote(eid2, "this-is-a-message", _options, false);
    console.log(ethers.utils.formatEther(fee.nativeFee.toString()));

    const receipt = await myoappA.send(eid2, _message, _options.toHex(), {value: fee.nativeFee});
    // console.log(receipt);

    console.log("B new message: ", await myoappB.data());

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});