/*
 * Copyright 2022 ConsenSys Software Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
package net.consensys.gpact.messaging.common.attestorrelayer;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import net.consensys.gpact.common.BlockchainId;
import net.consensys.gpact.common.CrosschainProtocolStackException;
import net.consensys.gpact.common.FormatConversion;
import org.web3j.protocol.core.methods.response.Log;
import org.web3j.protocol.core.methods.response.TransactionReceipt;

public class AttestorRelayer {
  private String relayerUri;
  private byte[] signingKey;
  private String msgStoreAddr;

  public static class Source {
    BlockchainId bcId;
    String crosschainControlAddr;
    String observerUri;
    String contractType;
    String bcWsUri;

    public Source(
        BlockchainId bcId,
        String crosschainControlAddr,
        String contractType,
        String observerUri,
        String bcWsUri) {
      this.bcId = bcId;
      this.crosschainControlAddr = crosschainControlAddr;
      this.contractType = contractType;
      this.observerUri = observerUri;
      this.bcWsUri = bcWsUri;
    }

    public String getSourceId() {
      return this.bcId.toString() + this.crosschainControlAddr;
    }

    public BlockchainId getBlockchainId() {
      return bcId;
    }

    public String getCrosschainControlAddr() {
      return crosschainControlAddr;
    }
  }

  public static class Dest {
    BlockchainId sourceBcId;
    BlockchainId targetBcId;
    String targetBcWsUri;
    byte[] txPKey;
    String targetChainVerifierAddr;

    public Dest(
        BlockchainId sourceBcId,
        BlockchainId targetBcId,
        String targetBcWsUri,
        byte[] txPKey,
        String targetChainVerifierAddr) {
      this.sourceBcId = sourceBcId;
      this.targetBcId = targetBcId;
      this.targetBcWsUri = targetBcWsUri;
      this.txPKey = txPKey;
      this.targetChainVerifierAddr = targetChainVerifierAddr;
    }

    public String getDestId() {
      return this.sourceBcId.toString() + this.targetBcId.toString();
    }
  }

  Map<String, Source> sources = new HashMap<>();

  public AttestorRelayer(String relayerUri, byte[] signingKey) {
    this.relayerUri = relayerUri;
    this.signingKey = signingKey;
  }

  public AttestorRelayer(String msgStoreAddresses) {
    this.msgStoreAddr = msgStoreAddresses;
  }

  public void addNewSource(
      BlockchainId bcId,
      String crosschainControlAddr,
      String contractType,
      String observerUri,
      String bcWsUri)
      throws CrosschainProtocolStackException {
    addNewSource(new Source(bcId, crosschainControlAddr, contractType, observerUri, bcWsUri));
  }

  public void addNewSource(Source source) throws CrosschainProtocolStackException {
    this.sources.put(source.getSourceId(), source);

    // AttestorRelayerWebApi.stopObserver(source.observerUri);

    AttestorRelayerWebApi.setupObserver(
        source.observerUri,
        source.bcId,
        source.bcWsUri,
        source.contractType,
        source.crosschainControlAddr);
    AttestorRelayerWebApi.setupRelayer(
        this.relayerUri, source.bcId, source.crosschainControlAddr, this.signingKey);
  }

  public void addMessageStore(
      String msgDispatcherUrl, String msgStoreAddrFromDispatcher, String msgStoreAddrFromUser)
      throws CrosschainProtocolStackException {
    AttestorRelayerWebApi.setupDispatcherForMsgStore(msgDispatcherUrl, msgStoreAddrFromDispatcher);
    this.msgStoreAddr = msgStoreAddrFromUser;
  }

  public void setDispatcher(String msgDispatcherUrl, Dest dest)
      throws CrosschainProtocolStackException {
    AttestorRelayerWebApi.setupDispatcherForRelayingEvents(
        msgDispatcherUrl,
        dest.sourceBcId,
        dest.targetBcId,
        dest.targetBcWsUri,
        dest.txPKey,
        dest.targetChainVerifierAddr);
  }

  public void addMessageStoreRoute(String relayerUri, String sourceNetwork, String sourceAddress)
      throws CrosschainProtocolStackException {
    AttestorRelayerWebApi.addMessageStoreRoute(relayerUri, sourceNetwork, sourceAddress);
  }

  public String fetchedSignedEvent(
      BlockchainId bcId,
      TransactionReceipt txr,
      String contractAddress,
      byte[] eventFunctionSignature)
      throws CrosschainProtocolStackException {
    String eventId = calculateEventID(bcId, txr, contractAddress, eventFunctionSignature);

    return AttestorRelayerWebApi.fetchSignedEvent("http://" + this.msgStoreAddr, eventId);
  }

  public static String calculateEventID(
      BlockchainId bcId,
      TransactionReceipt txr,
      String contractAddress,
      byte[] eventFunctionSignature) {
    String chainId = bcId.toDecimalString();

    List<Log> logs = txr.getLogs();
    for (Log log : logs) {
      if (log.getAddress().equalsIgnoreCase(contractAddress)
          && log.getTopics()
              .get(0)
              .equalsIgnoreCase(FormatConversion.byteArrayToString(eventFunctionSignature))) {

        String eventAddr = log.getAddress().toLowerCase();
        String blockNumberHex = log.getBlockNumberRaw();
        String blockNumber = FormatConversion.hexStringToDecString(blockNumberHex);
        String txIndexHex = log.getTransactionIndexRaw();
        String txIndex = FormatConversion.hexStringToDecString(txIndexHex);
        String logIndexHex = log.getLogIndexRaw();
        String logIndex = FormatConversion.hexStringToDecString(logIndexHex);
        return "" + chainId + "-" + eventAddr + "-" + blockNumber + "-" + txIndex + "-" + logIndex;
      }
    }
    throw new RuntimeException("Event not found");
  }
}
