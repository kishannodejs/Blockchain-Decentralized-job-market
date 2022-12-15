import useEth from "../../contexts/EthContext/useEth";

import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';

import React from 'react'

import classes from './Tx.module.css';

export default function Tx() {
    const { balanceUpdate,
        setTx,
        receipt,
        setReceipt } = useEth();

    const receiptType = () => {
        for (const i of Object.keys(receipt.events)) {
            if (i.length > 3) {
                return i;
            }
        }
    }
    const onClose = () => {
        // console.log(receipt);
        balanceUpdate();
        setReceipt({});
        setTx(false);
    }

    return (
        <>
            <div className={classes.backdrop} />
            <Card className={classes.modal} >
                <Card.Header><strong>{receiptType()}</strong></Card.Header>
                <Card.Body>
                    <Card.Title>TransactionHash</Card.Title>
                    <Card.Text>
                        <Link onClick={() => window.open(`https://mumbai.polygonscan.com/tx/${receipt.transactionHash}`)}>{receipt.transactionHash}</Link>
                    </Card.Text>
                    <Button variant="primary" onClick={onClose}>Close</Button>
                </Card.Body>
            </Card>
        </>
    )
}
