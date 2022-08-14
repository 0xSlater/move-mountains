import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const execP = promisify(exec);

export const publishContract = async (signer: any) => {
  let compiledModules: string[] = [];

  try {
    // When using --dump-bytecode-as-base64 build won't show all errors
    await execP('sui move build');
  } catch (error) {
    console.error(error.message);
  }
  try {
    const { stdout, stderr } = await execP(
      'sui move build  --dump-bytecode-as-base64'
    );
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`bytecode: ${stdout}`);
    compiledModules = JSON.parse(stdout);
  } catch (error) {
    if (error) {
      console.log(`error: ${error.message}`);
      throw error;
    }
  }

  const publishTxn = await signer.publish({
    compiledModules,
    gasBudget: 10000,
  });

  fs.writeFileSync(
    path.resolve(__dirname, '../published.json'),
    JSON.stringify(publishTxn, null, 2)
  );
  console.log(
    chalk.bold.blueBright(
      `https://explorer.devnet.sui.io/transactions/${publishTxn.certificate.transactionDigest}`
    )
  );
  return publishTxn;
};
