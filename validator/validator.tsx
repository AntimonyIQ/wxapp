// This file is part of the Wealthx project.
// Copyright © 2023 Wealthx. All rights reserved.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export default class Validate {
    public static Email(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    public static Password(password: string): boolean {
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }

    public static Username(username: string): boolean {
        const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
        return usernameRegex.test(username);
    }

    public static TagName(tagName: string): boolean {
        const tagNameRegex = /^[a-zA-Z0-9_]{3,30}$/;
        return tagNameRegex.test(tagName);
    }

    public static FullName(fullName: string): boolean {
        const fullNameRegex = /^[a-zA-Z\s]{3,100}$/;
        return fullNameRegex.test(fullName);
    }

    public static PhoneNumber(phoneNumber: string): boolean {
        const phoneNumberRegex = /^\+?\d+$/;
        return phoneNumberRegex.test(phoneNumber);
    }

    public static Address(address: string): boolean {
        const addressRegex = /^[a-zA-Z0-9\s,.'-]{3,100}$/;
        return addressRegex.test(address);
    }

    public static Date(date: string): boolean {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format
        return dateRegex.test(date);
    }

    public static Number(value: string): boolean {
        const numberRegex = /^-?\d+(\.\d+)?$/; // Matches integers and decimals
        return numberRegex.test(value);
    }

    public static Boolean(value: string): boolean {
        return value === "true" || value === "false";
    }

    public static ObjectId(id: string): boolean {
        const objectIdRegex = /^[a-fA-F0-9]{24}$/; // MongoDB ObjectId format
        return objectIdRegex.test(id);
    }

    public static Enum(value: string, enumValues: string[]): boolean {
        return enumValues.includes(value);
    }

    public static Array(value: any): boolean {
        return Array.isArray(value);
    }

    public static Pin(pin: string): boolean {
        const pinRegex = /^\d{4}$/; // 4-digit PIN
        return pinRegex.test(pin);
    }

    public static Url(url: string): boolean {
        const urlRegex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w- .\/?%&=]*)?$/;
        return urlRegex.test(url);
    }

    public static HexColor(color: string): boolean {
        const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
        return hexColorRegex.test(color);
    }

    public static CreditCard(cardNumber: string): boolean {
        const cardNumberRegex = /^\d{16}$/;
        return cardNumberRegex.test(cardNumber);
    }

    public static IpAddress(ip: string): boolean {
        const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegex.test(ip);
    }

    public static MacAddress(mac: string): boolean {
        const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        return macRegex.test(mac);
    }

    public static Uuid(uuid: string): boolean {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }

    public static BVN(bvn: string): boolean {
        const bvnRegex = /^\d{11}$/; // 11-digit Nigerian BVN
        return bvnRegex.test(bvn);
    }

    public static NIN(nin: string): boolean {
        const ninRegex = /^\d{11}$/; // 11-digit Nigerian NIN
        return ninRegex.test(nin);
    }

    public static TIN(tin: string): boolean {
        const tinRegex = /^[A-Z0-9]{3,15}$/; // Adjust regex based on TIN format
        return tinRegex.test(tin);
    }

    public static CacNumber(cacNumber: string): boolean {
        const cacNumberRegex = /^[A-Z0-9]{10,15}$/; // Adjust regex based on CAC number format
        return cacNumberRegex.test(cacNumber);
    }

    public static BankAccountNumber(accountNumber: string): boolean {
        const accountNumberRegex = /^\d{10,12}$/; // Adjust regex based on bank account number format
        return accountNumberRegex.test(accountNumber);
    }

    public static BankSortCode(sortCode: string): boolean {
        const sortCodeRegex = /^\d{6}$/; // 6-digit sort code
        return sortCodeRegex.test(sortCode);
    }

    public static Iban(iban: string): boolean {
        const ibanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/; // Adjust regex based on IBAN format
        return ibanRegex.test(iban);
    }

    public static SwiftCode(swiftCode: string): boolean {
        const swiftCodeRegex = /^[A-Z]{4}[A-Z0-9]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/; // Adjust regex based on SWIFT code format
        return swiftCodeRegex.test(swiftCode);
    }

    public static PostalCode(postalCode: string): boolean {
        const postalCodeRegex = /^[A-Za-z0-9\s-]{3,10}$/; // Adjust regex based on postal code format
        return postalCodeRegex.test(postalCode);
    }
}
