import scapy.all as scapy
import pandas as pd
from datetime import datetime
import json
import sys

# Ensure full display of DataFrame in console
pd.set_option('display.max_columns', None)
pd.set_option('display.max_colwidth', None)
pd.set_option('display.expand_frame_repr', False)
pd.set_option('display.max_rows', None)


def serialize_flag_value(flag_value):
    # Example serialization logic for FlagValue objects
    return {
        "attribute1": flag_value.attribute1 if hasattr(flag_value, 'attribute1') else None,
        "attribute2": flag_value.attribute2 if hasattr(flag_value, 'attribute2') else None,
        # Add more attributes as needed
    }


def extract_packet_details(packet):
    # Ensure the packet time is a float
    packet_time = float(packet.time)

    details = {
        "time": packet_time,
        "arrival_time": datetime.fromtimestamp(packet_time).strftime('%Y-%m-%d %H:%M:%S'),
        "UTC_arrival_time": datetime.utcfromtimestamp(packet_time).strftime('%Y-%m-%d %H:%M:%S'),
        "frame_number": packet.sniffed_on if hasattr(packet, 'sniffed_on') else None,
        "protocol_in_frame": packet.proto if hasattr(packet, 'proto') else None,
        "coloring_rule_name": None,  # Placeholder, needs custom logic
        "coloring_rule_strength": None,  # Placeholder, needs custom logic
        "source": packet.src if hasattr(packet, 'src') else None,
        "destination": packet.dst if hasattr(packet, 'dst') else None,
        "source_port": packet.sport if hasattr(packet, 'sport') else None,
        "destination_port": packet.dport if hasattr(packet, 'dport') else None,
        "length": len(packet),
        "info": packet.summary(),
        "frames": packet.seq if packet.haslayer(scapy.TCP) else None,
        "bytes": packet.ack if packet.haslayer(scapy.TCP) else None,
        "header_checksum_status": packet.chksum if packet.haslayer(scapy.TCP) else None,
        "ethernet": packet.getlayer(scapy.Ether).fields if packet.haslayer(scapy.Ether) else None,
        "queries": packet.qr if packet.haslayer(scapy.DNS) else None,
        "answers": packet.opcode if packet.haslayer(scapy.DNS) else None,
        # Example serialization
        "flags": serialize_flag_value(packet.flags) if hasattr(packet, 'flags') else None,
        "ports": None,  # Placeholder, needs custom logic
        "details": {}
    }

    # Extract more detailed information from the packet
    if packet.haslayer(scapy.Ether):
        details["details"]["Ethernet"] = packet.getlayer(scapy.Ether).fields

    if packet.haslayer(scapy.IP):
        details["details"]["IP"] = packet.getlayer(scapy.IP).fields

    if packet.haslayer(scapy.TCP):
        details["details"]["TCP"] = packet.getlayer(scapy.TCP).fields

    if packet.haslayer(scapy.UDP):
        details["details"]["UDP"] = packet.getlayer(scapy.UDP).fields

    if packet.haslayer(scapy.DNS):
        details["details"]["DNS"] = packet.getlayer(scapy.DNS).fields

    return details


def read_pcap(file_path):
    packets = scapy.rdpcap(file_path)
    packet_details = [extract_packet_details(packet) for packet in packets]
    return packet_details


def main():
    # Get the pcap file path from command-line arguments
    file_path = sys.argv[1]
    packet_details = read_pcap(file_path)

    # Serialize non-serializable objects before saving to JSON
    for packet in packet_details:
        if 'flags' in packet and packet['flags'] is not None:
            packet['flags'] = serialize_flag_value(packet['flags'])

    # Convert packet details to JSON string and print to stdout
    packet_details_json = json.dumps(packet_details, indent=4, default=str)
    print(packet_details_json)


if __name__ == "__main__":
    main()
