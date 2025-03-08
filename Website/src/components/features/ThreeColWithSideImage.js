import React from "react";
import styled from "styled-components";
import tw from "twin.macro";
//eslint-disable-next-line
import { css } from "styled-components/macro";
import { SectionHeading, Subheading as SubheadingBase } from "components/misc/Headings.js";
import { SectionDescription } from "components/misc/Typography.js";

import defaultCardImage from "images/shield-icon.svg";

import { ReactComponent as SvgDecoratorBlob3 } from "images/svg-decorator-blob-3.svg";

import CloudIconImage from "images/cloud.svg"
import MapIconImage from "images/map-pin.svg"
import TemperatureIconImage from "images/thermometer.svg"
import BatteryIconImage from "images/battery-charging.svg"
import AlertIconImage from "images/alert-circle.svg"
import FeatherIconImage from "images/feather.svg"

const Container = tw.div`relative`;

const ThreeColumnContainer = styled.div`
  ${tw`flex flex-col items-center md:items-stretch md:flex-row flex-wrap md:justify-center max-w-screen-lg mx-auto py-20 md:py-24`}
`;
const Subheading = tw(SubheadingBase)`mb-4`;
const Heading = tw(SectionHeading)`!text-center w-full`;
const Description = tw(SectionDescription)`w-full text-center`;

const VerticalSpacer = tw.div`mt-10 w-full`

const Column = styled.div`
  ${tw`md:w-1/2 lg:w-1/3 max-w-sm`}
`;

const Card = styled.div`
  ${tw`flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left h-full mx-4 px-2 py-8`}
  .imageContainer {
    ${tw`border text-center rounded-full p-5 flex-shrink-0`}
    img {
      ${tw`w-6 h-6`}
    }
  }

  .textContainer {
    ${tw`sm:ml-4 mt-4 sm:mt-2`}
  }

  .title {
    ${tw`mt-4 tracking-wide font-bold text-2xl leading-none`}
  }

  .description {
    ${tw`mt-1 sm:mt-4 font-medium text-secondary-200 leading-loose`}
  }
`;

const DecoratorBlob = styled(SvgDecoratorBlob3)`
  ${tw`pointer-events-none absolute right-0 bottom-0 w-64 opacity-25 transform translate-x-32 translate-y-48 `}
`;

export default ({ cards = null, heading = "Innovative Features", subheading = "", description = "Based on feedback from pet owners, we've designed features that prioritize your pet's health, safety, and happiness. From real-time tracking to health monitoring, these solutions offer peace of mind for both you and your pet." }) => {
  /*
   * This componets has an array of object denoting the cards defined below. Each object in the cards array can have the key (Change it according to your need, you can also add more objects to have more cards in this feature component) or you can directly pass this using the cards prop:
   *  1) imageSrc - the image shown at the top of the card
   *  2) title - the title of the card
   *  3) description - the description of the card
   *  If a key for a particular card is not provided, a default value is used
   */

  const defaultCards = [
    {
      imageSrc: BatteryIconImage,
      title: "Long-Lasting Battery",
      description: "Energy-efficient sensors in a lightweight package provide up to a month of battery life."
    },
    {
      imageSrc: CloudIconImage,
      title: "Secure Cloud Storage",
      description: "All pet health data is encrypted and stored safely in the cloud for seamless access anytime."
    },
    {
      imageSrc: FeatherIconImage,
      title: "Lightweight & Comfortable",
      description: "Designed for daily wear, our smart collar is durable yet light enough for pets of all sizes."
    },
    // {
    //   imageSrc: SupportIconImage,
    //   title: "Advanced Sleep Tracking",
    //   description: "Monitors sleep cycles and rest quality to ensure your pet is getting the recovery they need."
    // },
    {
      imageSrc: MapIconImage,
      title: "Location & Activity Tracking",
      description: "Real-time tracking of distanced travelled, steps, and location history helps you keep tabs on your pet’s adventures."
    },
    {
      imageSrc: TemperatureIconImage,
      title: "Area Monitoring & Temperature",
      description: "Continuously tracks surrounding weather and body temperature to keep your pet safe from extreme conditions."
    },
    {
      imageSrc: AlertIconImage,
      title: "Real-Time Alerts & Notifications",
      description: "Instant notifications for abnormal activity, temperature changes, and environmental hazards."
    }
  ];

  if (!cards) cards = defaultCards;

  return (
    <Container>
      <ThreeColumnContainer>
        {subheading && <Subheading>{subheading}</Subheading>}
        <Heading>{heading}</Heading>
        {description && <Description>{description}</Description>}
        <VerticalSpacer />
        {cards.map((card, i) => (
          <Column key={i}>
            <Card>
              <span className="imageContainer">
                <img src={card.imageSrc || defaultCardImage} alt="" />
              </span>
              <span className="textContainer">
                <span className="title">{card.title || "Fully Secure"}</span>
                <p className="description">
                  {card.description || "Lorem ipsum donor amet siti ceali ut enim ad minim veniam, quis nostrud."}
                </p>
              </span>
            </Card>
          </Column>
        ))}
      </ThreeColumnContainer>
      <DecoratorBlob />
    </Container>
  );
};
