import React from "react";
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import { css } from "styled-components/macro"; //eslint-disable-line

import Hero from "components/hero/BackgroundAsImage.js";
import Features from "components/features/ThreeColWithSideImage.js";
import MainFeature from "components/features/TwoColSingleFeatureWithStats2.js";
import MainFeature2 from "components/features/TwoColWithTwoFeaturesAndButtons.js";
import MainFeature3 from "components/features/TwoColSingleFeatureWithStats.js";
import FeatureWithSteps from "components/features/TwoColWithSteps.js";
import Pricing from "components/pricing/ThreePlans.js";
import Testimonial from "components/testimonials/TwoColumnWithImageAndProfilePictureReview.js";
import FAQ from "components/faqs/SimpleWithSideImage.js";
import ContactUsForm from "components/forms/TwoColContactUsWithIllustration.js";
import DownloadApp from "components/cta/DownloadApp.js";
import Footer from "components/footers/MiniCenteredFooter.js";
import customerSupportIllustrationSrc from "images/faq.svg";

export default () => {
    return (
        <AnimationRevealPage>
        <Hero />
        <MainFeature />
        <Features />
        <MainFeature2 />
        <MainFeature3 />
        <Testimonial />
        <FeatureWithSteps />
        <Pricing />
        <FAQ
          imageSrc={customerSupportIllustrationSrc}
          imageContain={true}
          imageShadow={false}
          subheading="FAQs"
          heading={
            <>
              Do you have <span tw="text-primary-500">Questions ?</span>
            </>
          }
        />
        <ContactUsForm />
        <DownloadApp/>
        <Footer />
      </AnimationRevealPage>
    );
};