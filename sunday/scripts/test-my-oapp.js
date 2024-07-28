const { ethers } = require("hardhat");

async function main() {
    const MyOApp = await ethers.getContractFactory("MyOApp");
    const EndpointV2Mock = await ethers.getContractFactory("EndpointV2Mock");

    const [delegate, peer] = await ethers.getSigners();

    const eid1 = 1;
    const endpoint = await EndpointV2Mock.deploy(eid1);

    const myoapp = await MyOApp.deploy(endpoint.target, delegate.address);

    console.log("myoapp version: ", await myoapp.oAppVersion());

    // let bytes32Address = ethers.utils.hexZeroPad(peer.address, 32);
    // let bytes32Address = ethers.utils.zeroPad(ethers.utils.arrayify(address), 32);
    let bytes32Address = ethers.zeroPadValue(peer.address, 32); // to the right

    await myoapp.setPeer(eid1, bytes32Address);

    console.log("peer address  : ", peer.address);
    console.log("Peer for eid 1: ", await myoapp.peers(1));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});