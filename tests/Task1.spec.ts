import { Blockchain, SandboxContract, TreasuryContract, printTransactionFees } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { Task1 } from '../wrappers/Task1';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import { KeyPair, mnemonicNew, mnemonicToPrivateKey } from 'ton-crypto';

describe('Task1', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task1');
    });

    let blockchain: Blockchain;
    let task1: SandboxContract<Task1>;
    
    let kp: KeyPair;
    let receiver: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        kp = await mnemonicToPrivateKey(await mnemonicNew());
        receiver = await blockchain.treasury('receiver');

        task1 = blockchain.openContract(Task1.createFromConfig({
            publicKey: kp.publicKey,
            executionTime: Math.floor(new Date().getTime() / 1000) - 100,
            receiver: receiver.address,
            seqno: 1,
        }, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task1.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task1.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task1 are ready to use
    });

    it('should', async () => {
        const claimer = await blockchain.treasury('claimer');

        const claimResult = await task1.sendClaim(claimer.getSender(), toNano('0.05'));
        
        expect(claimResult.transactions).toHaveTransaction({
            from: task1.address,
            to: receiver.address,
            success: true,
        });
        
        printTransactionFees(claimResult.transactions);
    });
});
