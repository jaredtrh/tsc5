import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { Cell, Dictionary, toNano } from 'ton-core';
import { Task2 } from '../wrappers/Task2';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task2', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task2');
    });

    let blockchain: Blockchain;
    let task2: SandboxContract<Task2>;

    let admin: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        admin = await blockchain.treasury('admin');

        task2 = blockchain.openContract(Task2.createFromConfig({
            adminAddress: admin.address,
            users: Dictionary.empty(),
        }, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task2.sendDeploy(deployer.getSender(), toNano('0.05'));
        
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task2.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task2 are ready to use
    });

    it('should add user', async () => {
        const user = await blockchain.treasury('user');

        const addUserResult = await task2.sendAddUser(admin.getSender(), toNano('0.05'), user.address, 123);
        
        expect(addUserResult.transactions).toHaveTransaction({
            from: admin.address,
            to: task2.address,
            success: true,
        });

        const userShare = await task2.getUserShare(user.address);
        console.log(userShare);
    });

    it('should remove user', async () => {
        const user = await blockchain.treasury('user');

        await task2.sendAddUser(admin.getSender(), toNano('0.05'), user.address, 123);
        const removeUserResult = await task2.sendRemoveUser(admin.getSender(), toNano('0.05'), user.address);
        
        expect(removeUserResult.transactions).toHaveTransaction({
            from: admin.address,
            to: task2.address,
            success: true,
        });
    });

    it('should split ton', async () => {
        const user1 = await blockchain.treasury('user1');
        const user2 = await blockchain.treasury('user2');

        await task2.sendAddUser(admin.getSender(), toNano('0.05'), user1.address, 25);
        await task2.sendAddUser(admin.getSender(), toNano('0.05'), user2.address, 75);
        const splitTonResult = await task2.sendSplitTon(admin.getSender(), toNano('0.05'), toNano('0.05'));
        
        expect(splitTonResult.transactions).toHaveTransaction({
            from: task2.address,
            to: user1.address,
            success: true,
            value: toNano('0.0125'),
        });
        
        expect(splitTonResult.transactions).toHaveTransaction({
            from: task2.address,
            to: user2.address,
            success: true,
            value: toNano('0.0375'),
        });
    });

    it('should transfer notification', async () => {
        const user1 = await blockchain.treasury('user1');
        const user2 = await blockchain.treasury('user2');

        await task2.sendAddUser(admin.getSender(), toNano('0.05'), user1.address, 25);
        await task2.sendAddUser(admin.getSender(), toNano('0.05'), user2.address, 75);
        const splitTonResult = await task2.sendTransferNotification(admin.getSender(), toNano('0.05'), toNano('0.05'));
        
        expect(splitTonResult.transactions).toHaveTransaction({
            from: task2.address,
            to: user1.address,
            success: true,
            value: toNano('0.0125'),
        });
        
        expect(splitTonResult.transactions).toHaveTransaction({
            from: task2.address,
            to: user2.address,
            success: true,
            value: toNano('0.0375'),
        });
    });
});
