import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { Task4Basic } from '../wrappers/Task4Basic';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import { task2ConfigToCell } from '../wrappers/Task2';

describe('Task4Basic', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task4Basic');
    });

    let blockchain: Blockchain;
    let task4Basic: SandboxContract<Task4Basic>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task4Basic = blockchain.openContract(Task4Basic.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task4Basic.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task4Basic.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task4Basic are ready to use
    });

    it('should maze', async () => {
        const maze = [
            /*"S.......",
            "........",
            "........",
            "........",
            "........",
            "........",
            "...E....",
            "........",
            
            "XXXXXXE.",
            "XX.XXXX.",
            "X.X.XX.X",
            ".?XSXXX.",
            "?.XXXXX.",
            "XX..XXX.",
            "XX..XX?X",
            "XXX...XX",
            */
            "SX.?X",
            ".XX.X",
            "X.?..",
            ".??..",
            "X?...",
            "..X.X",
            "..?..",
            "X...E",
        ];
        const [changes, obstacles, length, ans] = await task4Basic.getSolve(maze);

        console.log(changes);
        console.log(obstacles);
        console.log(length);
        let s = "";
        for (let i = 0; i < maze.length; ++i) {
            let row = ans.readTuple();
            for (let j = 0; j < maze[0].length; ++j) {
                s += String.fromCharCode(row.readNumber());
            }
            s += "\n";
        }
        console.log(s);
    });
});
