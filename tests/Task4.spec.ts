import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { Task4 } from '../wrappers/Task4';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task4', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task4');
    });

    let blockchain: Blockchain;
    let task4: SandboxContract<Task4>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task4 = blockchain.openContract(Task4.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task4.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task4.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task4 are ready to use
    });

    it('should maze', async () => {
        const maze = [/*
            "S..............................",
            "...............................",
            "...............................",
            "...............................",
            "...............................",
            "...............................",
            "...............................",
            "...............................",
            "...............................",
            "...............................",
            "...............................",
            "...............................",
            "...............................",
            "...............................",
            "...............................",
            "...............................",
            "...............................",
            "...............................",
            "...............................",
            "...............................",
            "...............................",
            "...............................",
            "...............................",
            "...............................",
            "...............................",
            "...............................",
            "...............................",
            "...............................",
            "...............................",
            "...............................",
            "..............................E",
            
            "S.......",
            ".X......",
            "........",
            "........",
            "........",
            "........",
            "...E....",
            "........",
            */
            "XXXXXXE.",
            "XX.XXXX.",
            "X.X.XXXX",
            ".?XSXXX.",
            "?.XXXXX.",
            "XX..XXX.",
            "XX..XX?X",
            "XXX...XX",
            /*
            "SX.?X",
            ".XX.X",
            "X.?..",
            ".??..",
            "X?...",
            "..X.X",
            "..?..",
            "X...E",*/
        ];
        const [changes, obstacles, length, ans] = await task4.getSolve(maze);

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
